import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get memories assigned to a profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    
    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }
    
    // Verify profile ownership
    const { data: profile } = await supabase
      .from('memory_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    // Get assigned memory IDs
    const { data: assignments } = await supabase
      .from('profile_memories')
      .select('memory_id')
      .eq('profile_id', profileId)
    
    const memoryIds = (assignments || []).map(a => a.memory_id)
    
    // Get full memory details
    if (memoryIds.length > 0) {
      const { data: memories } = await supabase
        .from('user_memories')
        .select('*')
        .in('id', memoryIds)
      
      return NextResponse.json({ memories: memories || [] })
    }
    
    return NextResponse.json({ memories: [] })
    
  } catch (error) {
    console.error('Get profile memories error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Assign memories to a profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { profileId, memoryIds } = await request.json()
    
    if (!profileId || !Array.isArray(memoryIds)) {
      return NextResponse.json({ error: 'Profile ID and memory IDs required' }, { status: 400 })
    }
    
    // Verify profile ownership
    const { data: profile } = await supabase
      .from('memory_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    // Delete existing assignments
    await supabase
      .from('profile_memories')
      .delete()
      .eq('profile_id', profileId)
    
    // Insert new assignments
    if (memoryIds.length > 0) {
      const assignments = memoryIds.map(memoryId => ({
        profile_id: profileId,
        memory_id: memoryId,
      }))
      
      const { error } = await supabase
        .from('profile_memories')
        .insert(assignments)
      
      if (error) {
        console.error('Insert assignments error:', error)
        return NextResponse.json({ error: 'Failed to assign memories' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ success: true, count: memoryIds.length })
    
  } catch (error) {
    console.error('Assign memories error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/profiles/memories/export - Export profile as ChatGPT format
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { profileId, format = 'chatgpt' } = await request.json()
    
    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }
    
    // Get profile
    const { data: profile } = await supabase
      .from('memory_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    // Get assigned memories
    const { data: assignments } = await supabase
      .from('profile_memories')
      .select('memory_id')
      .eq('profile_id', profileId)
    
    const memoryIds = (assignments || []).map(a => a.memory_id)
    
    let memories: { content: string | null; title: string; description: string | null }[] = []
    if (memoryIds.length > 0) {
      const { data } = await supabase
        .from('user_memories')
        .select('content, title, description')
        .in('id', memoryIds)
      memories = data || []
    }
    
    // Format for ChatGPT
    if (format === 'chatgpt') {
      // ChatGPT memory format is an array of memory objects
      const chatgptFormat = memories.map(m => {
        try {
          // If content is already JSON, parse it
          return JSON.parse(m.content || '{}')
        } catch {
          // Otherwise, create a simple memory object
          return {
            id: crypto.randomUUID(),
            content: m.content || m.title,
            created_at: new Date().toISOString()
          }
        }
      })
      
      return NextResponse.json({
        profile: profile.name,
        format: 'chatgpt',
        memories: chatgptFormat,
        export_date: new Date().toISOString()
      })
    }
    
    // Plain text format
    const plainText = memories.map(m => m.content || '').join('\n\n')
    
    return NextResponse.json({
      profile: profile.name,
      format: 'text',
      content: plainText,
      memory_count: memories.length,
      export_date: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Export profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
