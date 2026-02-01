import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { calculateChecksum, calculateDiff } from '@/lib/cloud-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
    
    // 获取当前 Memory
    const { data: memory } = await supabase
      .from('cloud_memories')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (!memory) {
      return NextResponse.json(
        { error: 'Memory 不存在' },
        { status: 404 }
      )
    }
    
    // 获取要恢复的版本
    const { data: targetVersion } = await supabase
      .from('memory_versions')
      .select('*')
      .eq('cloud_memory_id', id)
      .eq('version_number', version_number)
      .single()
    
    if (!targetVersion) {
      return NextResponse.json(
        { error: '版本不存在' },
        { status: 404 }
      )
    }
    
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 获取最新版本号
    const { data: lastVersion } = await supabase
      .from('memory_versions')
      .select('version_number')
      .eq('cloud_memory_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()
    
    const newVersionNumber = (lastVersion?.version_number || 0) + 1
    const restoredContent = targetVersion.content as any
    const currentContent = memory.content as any
    
    // 计算差异
    const diff = calculateDiff(currentContent, restoredContent)
    diff.summary = `恢复到版本 #${version_number}: ${diff.summary}`
    
    // 创建新版本（标记为恢复操作）
    await adminSupabase
      .from('memory_versions')
      .insert({
        cloud_memory_id: id,
        version_number: newVersionNumber,
        content: restoredContent,
        diff,
        created_by: 'restore'
      })
    
    // 更新当前 Memory
    const newChecksum = calculateChecksum(restoredContent.raw)
    
    await adminSupabase
      .from('cloud_memories')
      .update({
        content: restoredContent,
        checksum: newChecksum,
        sync_status: 'synced',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    return NextResponse.json({
      success: true,
      restored_from: version_number,
      new_version: newVersionNumber,
      diff_summary: diff.summary
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '恢复失败' },
      { status: 500 }
    )
  }
}
