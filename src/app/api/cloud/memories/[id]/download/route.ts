import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

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
      .select('id, platform, account_label, content')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error || !memory) {
      return NextResponse.json(
        { error: 'Memory 不存在' },
        { status: 404 }
      )
    }
    
    const content = memory.content as any
    
    // 获取原始 raw 内容，或者重新构建
    let downloadContent: string
    
    if (content?.raw) {
      // 有原始内容，直接使用
      downloadContent = content.raw
    } else if (content?.items) {
      // 没有 raw，根据 platform 重新构建
      if (memory.platform === 'chatgpt') {
        // ChatGPT 格式是数组
        downloadContent = JSON.stringify(content.items.map((item: any) => ({
          id: item.id,
          key: item.key,
          value: item.value,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })), null, 2)
      } else if (memory.platform === 'claude') {
        // Claude 格式有 memories 包装
        downloadContent = JSON.stringify({
          memories: content.items,
          metadata: content.metadata
        }, null, 2)
      } else {
        // 默认 JSON
        downloadContent = JSON.stringify(content, null, 2)
      }
    } else {
      // 直接序列化 content
      downloadContent = JSON.stringify(content, null, 2)
    }
    
    const filename = `${memory.platform}-memory-${memory.account_label || 'default'}.json`
    
    return new NextResponse(downloadContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: '下载失败' },
      { status: 500 }
    )
  }
}
