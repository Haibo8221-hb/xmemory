import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    const { data: memory, error } = await supabase
      .from('cloud_memories')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error || !memory) {
      return NextResponse.json(
        { error: 'Memory 不存在' },
        { status: 404 }
      )
    }
    
    // 获取版本数量
    const { count: versionCount } = await supabase
      .from('memory_versions')
      .select('*', { count: 'exact', head: true })
      .eq('cloud_memory_id', id)
    
    return NextResponse.json({
      memory: {
        ...memory,
        version_count: versionCount || 0
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    // 使用 service role 删除（因为有级联删除 versions）
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 先验证所有权
    const { data: memory } = await supabase
      .from('cloud_memories')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (!memory) {
      return NextResponse.json(
        { error: 'Memory 不存在' },
        { status: 404 }
      )
    }
    
    // 删除（版本会级联删除）
    const { error: deleteError } = await adminSupabase
      .from('cloud_memories')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { account_label } = body
    
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    const { data: memory, error } = await supabase
      .from('cloud_memories')
      .update({ account_label })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: '更新失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ memory })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
