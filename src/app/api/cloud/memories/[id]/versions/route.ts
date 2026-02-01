import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    // 验证 Memory 所有权
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
    
    // 获取版本列表
    const { data: versions, error, count } = await supabase
      .from('memory_versions')
      .select('id, version_number, diff, created_by, created_at', { count: 'exact' })
      .eq('cloud_memory_id', id)
      .order('version_number', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Query error:', error)
      return NextResponse.json(
        { error: '获取失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      versions: versions || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取特定版本的完整内容
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { version_number } = body
    
    if (!version_number) {
      return NextResponse.json(
        { error: '缺少版本号' },
        { status: 400 }
      )
    }
    
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    // 验证 Memory 所有权
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
    
    // 获取特定版本
    const { data: version, error } = await supabase
      .from('memory_versions')
      .select('*')
      .eq('cloud_memory_id', id)
      .eq('version_number', version_number)
      .single()
    
    if (error || !version) {
      return NextResponse.json(
        { error: '版本不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ version })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
