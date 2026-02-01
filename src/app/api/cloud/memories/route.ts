import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    // 获取用户的所有云 Memory
    const { data: memories, error } = await supabase
      .from('cloud_memories')
      .select(`
        id,
        platform,
        account_label,
        content,
        checksum,
        sync_status,
        last_synced_at,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Query error:', error)
      return NextResponse.json(
        { error: '获取失败' },
        { status: 500 }
      )
    }
    
    // 为每个 memory 添加简要统计
    const memoriesWithStats = memories?.map(memory => {
      const content = memory.content as any
      return {
        ...memory,
        item_count: content?.items?.length || 0,
        preview: content?.items?.slice(0, 3).map((item: any) => ({
          key: item.key,
          value: item.value?.substring(0, 100) + (item.value?.length > 100 ? '...' : '')
        }))
      }
    })
    
    return NextResponse.json({
      memories: memoriesWithStats || [],
      count: memories?.length || 0
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
