import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List user's profiles with memory counts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('memory_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (profilesError) {
      console.error('Profiles error:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }
    
    // Get memory assignments for each profile
    const profilesWithCounts = await Promise.all((profiles || []).map(async (profile) => {
      const { count } = await supabase
        .from('profile_memories')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id)
      
      return {
        ...profile,
        memory_count: count || 0
      }
    }))
    
    // Get all user memories for assignment
    const { data: memories } = await supabase
      .from('user_memories')
      .select('id, title, platform, category')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    // Get active profile's memory assignments
    const activeProfile = profilesWithCounts.find(p => p.is_active)
    let activeMemoryIds: string[] = []
    
    if (activeProfile) {
      const { data: assignments } = await supabase
        .from('profile_memories')
        .select('memory_id')
        .eq('profile_id', activeProfile.id)
      
      activeMemoryIds = (assignments || []).map(a => a.memory_id)
    }
    
    return NextResponse.json({
      profiles: profilesWithCounts,
      memories: memories || [],
      activeMemoryIds,
    })
    
  } catch (error) {
    console.error('Profiles error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create new profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, icon, description, color } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('memory_profiles')
      .insert({
        user_id: user.id,
        name,
        icon: icon || '🎭',
        description,
        color: color || 'purple',
      })
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }
    
    return NextResponse.json({ profile: data })
    
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update profile or set active
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, action, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }
    
    // Special action: set active profile
    if (action === 'set_active') {
      // Deactivate all profiles
      await supabase
        .from('memory_profiles')
        .update({ is_active: false })
        .eq('user_id', user.id)
      
      // Activate this profile
      const { data, error } = await supabase
        .from('memory_profiles')
        .update({ is_active: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) {
        return NextResponse.json({ error: 'Failed to activate profile' }, { status: 500 })
      }
      
      return NextResponse.json({ profile: data })
    }
    
    // Regular update
    const allowedFields = ['name', 'icon', 'description', 'color']
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }
    
    const { data, error } = await supabase
      .from('memory_profiles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
    
    return NextResponse.json({ profile: data })
    
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete profile
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
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }
    
    // Check if it's a default profile
    const { data: profile } = await supabase
      .from('memory_profiles')
      .select('is_default')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (profile?.is_default) {
      return NextResponse.json({ error: 'Cannot delete default profile' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('memory_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
