import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scanPrivacy, categorizeMemory } from '@/lib/privacy-detector'

// GET - Analyze all user memories
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
    
    // Analyze each memory
    const analyzedMemories = (memories || []).map(memory => {
      const content = memory.content || memory.title + ' ' + (memory.description || '')
      const privacyResult = scanPrivacy(content)
      const categoryResult = categorizeMemory(content)
      
      return {
        ...memory,
        privacy: privacyResult,
        autoCategory: categoryResult,
      }
    })
    
    // Calculate overall stats
    const totalMemories = analyzedMemories.length
    const avgPrivacyScore = totalMemories > 0 
      ? Math.round(analyzedMemories.reduce((sum, m) => sum + m.privacy.score, 0) / totalMemories)
      : 100
    
    const highRiskCount = analyzedMemories.filter(m => m.privacy.issues.some((i: { type: string }) => i.type === 'high')).length
    const mediumRiskCount = analyzedMemories.filter(m => m.privacy.issues.some((i: { type: string }) => i.type === 'medium')).length
    
    // Group by category
    const byCategory: Record<string, typeof analyzedMemories> = {}
    for (const memory of analyzedMemories) {
      const cat = memory.category || memory.autoCategory.category || 'other'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(memory)
    }
    
    // Aggregate entities
    const allEntities = {
      names: [] as string[],
      locations: [] as string[],
      organizations: [] as string[],
      dates: [] as string[],
    }
    
    for (const memory of analyzedMemories) {
      allEntities.names.push(...memory.privacy.entities.names)
      allEntities.locations.push(...memory.privacy.entities.locations)
      allEntities.organizations.push(...memory.privacy.entities.organizations)
      allEntities.dates.push(...memory.privacy.entities.dates)
    }
    
    // Deduplicate
    allEntities.names = [...new Set(allEntities.names)]
    allEntities.locations = [...new Set(allEntities.locations)]
    allEntities.organizations = [...new Set(allEntities.organizations)]
    allEntities.dates = [...new Set(allEntities.dates)]
    
    return NextResponse.json({
      memories: analyzedMemories,
      stats: {
        total: totalMemories,
        avgPrivacyScore,
        highRiskCount,
        mediumRiskCount,
        safeCount: totalMemories - highRiskCount - mediumRiskCount,
      },
      byCategory,
      entities: allEntities,
    })
    
  } catch (error) {
    console.error('X-Ray error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Scan specific content
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { content, memoryId } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }
    
    const privacyResult = scanPrivacy(content)
    const categoryResult = categorizeMemory(content)
    
    // If memoryId provided, update the memory with analysis results
    if (memoryId) {
      await supabase
        .from('user_memories')
        .update({
          privacy_score: privacyResult.score,
          privacy_issues: privacyResult.issues,
          entities: privacyResult.entities,
          category: categoryResult.category,
          subcategory: categoryResult.subcategory,
          tags: categoryResult.tags,
          last_analyzed: new Date().toISOString(),
        })
        .eq('id', memoryId)
        .eq('user_id', user.id)
    }
    
    return NextResponse.json({
      privacy: privacyResult,
      category: categoryResult,
    })
    
  } catch (error) {
    console.error('X-Ray scan error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
