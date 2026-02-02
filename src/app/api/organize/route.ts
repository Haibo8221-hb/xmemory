import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Memory {
  id: string
  title: string
  content: string | null
  description: string | null
  platform: string
  created_at: string
}

interface Issue {
  type: 'conflict' | 'duplicate' | 'long' | 'stale' | 'orphan'
  severity: 'high' | 'medium' | 'low'
  memories: Memory[]
  suggestion: string
  action?: string
}

// GET - Analyze memories for organization issues
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get all user memories
    const { data: memories, error } = await supabase
      .from('user_memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
    }
    
    const issues: Issue[] = []
    
    // 1. Find duplicates (similar titles or content)
    const duplicates = findDuplicates(memories || [])
    issues.push(...duplicates)
    
    // 2. Find conflicts (contradictory information)
    const conflicts = findConflicts(memories || [])
    issues.push(...conflicts)
    
    // 3. Find long memories that should be split
    const longMemories = findLongMemories(memories || [])
    issues.push(...longMemories)
    
    // 4. Find stale memories (old, not updated)
    const staleMemories = findStaleMemories(memories || [])
    issues.push(...staleMemories)
    
    // Calculate health score
    const total = memories?.length || 0
    const highIssues = issues.filter(i => i.severity === 'high').length
    const mediumIssues = issues.filter(i => i.severity === 'medium').length
    const lowIssues = issues.filter(i => i.severity === 'low').length
    
    let healthScore = 100
    healthScore -= highIssues * 15
    healthScore -= mediumIssues * 8
    healthScore -= lowIssues * 3
    healthScore = Math.max(0, Math.min(100, healthScore))
    
    return NextResponse.json({
      healthScore,
      issues,
      stats: {
        total,
        duplicates: duplicates.length,
        conflicts: conflicts.length,
        longMemories: longMemories.length,
        staleMemories: staleMemories.length,
        issueCount: issues.length,
      }
    })
    
  } catch (error) {
    console.error('Organize error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Find duplicate memories
function findDuplicates(memories: Memory[]): Issue[] {
  const issues: Issue[] = []
  const checked = new Set<string>()
  
  for (let i = 0; i < memories.length; i++) {
    if (checked.has(memories[i].id)) continue
    
    const similar: Memory[] = [memories[i]]
    
    for (let j = i + 1; j < memories.length; j++) {
      if (checked.has(memories[j].id)) continue
      
      const similarity = calculateSimilarity(
        getMemoryText(memories[i]),
        getMemoryText(memories[j])
      )
      
      if (similarity > 0.7) {
        similar.push(memories[j])
        checked.add(memories[j].id)
      }
    }
    
    if (similar.length > 1) {
      checked.add(memories[i].id)
      issues.push({
        type: 'duplicate',
        severity: 'medium',
        memories: similar,
        suggestion: `Found ${similar.length} similar memories. Consider merging them.`,
        action: 'merge'
      })
    }
  }
  
  return issues
}

// Find conflicting information
function findConflicts(memories: Memory[]): Issue[] {
  const issues: Issue[] = []
  
  // Patterns that often conflict
  const conflictPatterns = [
    { name: 'age', patterns: [/(\d+)\s*岁/g, /(\d+)\s*years?\s*old/gi, /age[:\s]+(\d+)/gi] },
    { name: 'location', patterns: [/住在\s*([^\s,，。]+)/g, /(?:live|located)\s+in\s+([^\s,\.]+)/gi] },
    { name: 'job', patterns: [/(?:是|做)\s*([^\s,，。]{2,10}(?:经理|工程师|设计师|师|员))/g, /(?:work as|am a)\s+([^\s,\.]+)/gi] },
  ]
  
  for (const { name, patterns } of conflictPatterns) {
    const values: { value: string; memory: Memory }[] = []
    
    for (const memory of memories) {
      const text = getMemoryText(memory)
      for (const pattern of patterns) {
        const matches = text.match(pattern)
        if (matches) {
          for (const match of matches) {
            // Extract the captured group
            pattern.lastIndex = 0
            const result = pattern.exec(match)
            if (result && result[1]) {
              values.push({ value: result[1].toLowerCase(), memory })
            }
          }
        }
      }
    }
    
    // Check for conflicts
    const uniqueValues = [...new Set(values.map(v => v.value))]
    if (uniqueValues.length > 1) {
      const conflictingMemories = values.reduce((acc, v) => {
        if (!acc.find(m => m.id === v.memory.id)) {
          acc.push(v.memory)
        }
        return acc
      }, [] as Memory[])
      
      issues.push({
        type: 'conflict',
        severity: 'high',
        memories: conflictingMemories,
        suggestion: `Conflicting ${name} information: ${uniqueValues.join(' vs ')}. Please resolve.`,
        action: 'resolve'
      })
    }
  }
  
  return issues
}

// Find memories that are too long
function findLongMemories(memories: Memory[]): Issue[] {
  const issues: Issue[] = []
  const THRESHOLD = 500 // characters
  
  for (const memory of memories) {
    const text = getMemoryText(memory)
    if (text.length > THRESHOLD) {
      issues.push({
        type: 'long',
        severity: 'low',
        memories: [memory],
        suggestion: `Memory is ${text.length} characters. Consider splitting into smaller, focused memories.`,
        action: 'split'
      })
    }
  }
  
  return issues
}

// Find stale memories (not updated in 6+ months)
function findStaleMemories(memories: Memory[]): Issue[] {
  const issues: Issue[] = []
  const SIX_MONTHS_AGO = Date.now() - (180 * 24 * 60 * 60 * 1000)
  
  for (const memory of memories) {
    const createdAt = new Date(memory.created_at).getTime()
    if (createdAt < SIX_MONTHS_AGO) {
      issues.push({
        type: 'stale',
        severity: 'low',
        memories: [memory],
        suggestion: 'This memory is over 6 months old. Review if it\'s still accurate.',
        action: 'review'
      })
    }
  }
  
  return issues
}

// Helper: Get combined text from memory
function getMemoryText(memory: Memory): string {
  return [memory.title, memory.description, memory.content]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

// Helper: Calculate text similarity (Jaccard index)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 2))
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 2))
  
  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])
  
  if (union.size === 0) return 0
  return intersection.size / union.size
}

// POST - Apply organization action
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { action, memoryIds, mergedContent, keepId } = await request.json()
    
    switch (action) {
      case 'merge':
        // Keep one memory, delete others
        if (!keepId || !memoryIds || memoryIds.length < 2) {
          return NextResponse.json({ error: 'Invalid merge request' }, { status: 400 })
        }
        
        // Update the kept memory with merged content
        if (mergedContent) {
          await supabase
            .from('user_memories')
            .update({ content: mergedContent, updated_at: new Date().toISOString() })
            .eq('id', keepId)
            .eq('user_id', user.id)
        }
        
        // Delete the others
        const deleteIds = memoryIds.filter((id: string) => id !== keepId)
        await supabase
          .from('user_memories')
          .delete()
          .in('id', deleteIds)
          .eq('user_id', user.id)
        
        return NextResponse.json({ success: true, deleted: deleteIds.length })
      
      case 'delete':
        if (!memoryIds || memoryIds.length === 0) {
          return NextResponse.json({ error: 'No memories to delete' }, { status: 400 })
        }
        
        await supabase
          .from('user_memories')
          .delete()
          .in('id', memoryIds)
          .eq('user_id', user.id)
        
        return NextResponse.json({ success: true, deleted: memoryIds.length })
      
      case 'ignore':
        // Just acknowledge - in a real app, you might store this preference
        return NextResponse.json({ success: true })
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Organize action error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
