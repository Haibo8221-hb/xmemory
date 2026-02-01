import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List user's private memories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    
    let query = supabase
      .from('user_memories')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Memory bank error:', error)
      return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
    }
    
    return NextResponse.json({ memories: data })
    
  } catch (error) {
    console.error('Memory bank error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Add new memory to bank
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { platform, title, description, content, notes } = body
    
    if (!platform || !title) {
      return NextResponse.json({ error: 'Platform and title are required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('user_memories')
      .insert({
        user_id: user.id,
        platform,
        title,
        description,
        content,
        notes,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 })
    }
    
    return NextResponse.json({ memory: data })
    
  } catch (error) {
    console.error('Memory bank error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Remove memory from bank
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('user_memories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Memory bank error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update memory
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, title, description, content, notes, platform } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 })
    }
    
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (content !== undefined) updates.content = content
    if (notes !== undefined) updates.notes = notes
    if (platform !== undefined) updates.platform = platform
    
    // Increment version
    const { data: current } = await supabase
      .from('user_memories')
      .select('version')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (current) {
      updates.version = (current.version || 1) + 1
    }
    
    const { data, error } = await supabase
      .from('user_memories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
    }
    
    return NextResponse.json({ memory: data })
    
  } catch (error) {
    console.error('Memory bank error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
