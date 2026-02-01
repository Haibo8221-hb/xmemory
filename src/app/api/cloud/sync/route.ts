import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { 
  calculateChecksum, 
  parseMemoryContent, 
  calculateDiff,
  getPlanLimits,
  cleanupOldVersions 
} from '@/lib/cloud-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, account_label, content, force } = body
    
    if (!platform || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 验证用户身份
    const supabaseAuth = await createServerClient()
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 获取用户订阅计划
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    
    const plan = subscription?.plan || 'free'
    const limits = getPlanLimits(plan)
    
    // 检查账号数量限制
    if (limits.max_accounts > 0) {
      const { count } = await supabase
        .from('cloud_memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (count && count >= limits.max_accounts) {
        // 检查是否是更新现有的
        const { data: existing } = await supabase
          .from('cloud_memories')
          .select('id')
          .eq('user_id', user.id)
          .eq('platform', platform)
          .eq('account_label', account_label || '')
          .single()
        
        if (!existing) {
          return NextResponse.json(
            { error: `当前计划最多支持 ${limits.max_accounts} 个账号，请升级到 Pro` },
            { status: 403 }
          )
        }
      }
    }
    
    // 解析内容
    const parsedContent = parseMemoryContent(content)
    const newChecksum = calculateChecksum(content)
    const labelValue = account_label || ''
    
    // 查找现有记录
    const { data: existingMemory } = await supabase
      .from('cloud_memories')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('account_label', labelValue)
      .single()
    
    if (existingMemory) {
      // 检查是否有冲突
      if (!force && existingMemory.checksum !== newChecksum) {
        const existingContent = existingMemory.content as any
        if (existingContent.raw !== content) {
          // 可能有冲突，返回冲突信息
          // 但如果服务器版本更新，直接覆盖
        }
      }
      
      // 计算差异
      const diff = calculateDiff(existingMemory.content as any, parsedContent)
      
      // 创建新版本
      const { data: lastVersion } = await supabase
        .from('memory_versions')
        .select('version_number')
        .eq('cloud_memory_id', existingMemory.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()
      
      const newVersionNumber = (lastVersion?.version_number || 0) + 1
      
      await supabase
        .from('memory_versions')
        .insert({
          cloud_memory_id: existingMemory.id,
          version_number: newVersionNumber,
          content: parsedContent,
          diff,
          created_by: 'sync'
        })
      
      // 更新 cloud_memories
      await supabase
        .from('cloud_memories')
        .update({
          content: parsedContent,
          checksum: newChecksum,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMemory.id)
      
      // 清理旧版本
      await cleanupOldVersions(
        supabase,
        existingMemory.id,
        limits.max_versions,
        limits.version_days
      )
      
      return NextResponse.json({
        success: true,
        cloud_memory_id: existingMemory.id,
        version_number: newVersionNumber,
        action: 'updated',
        diff_summary: diff.summary
      })
    } else {
      // 创建新记录
      const { data: newMemory, error: insertError } = await supabase
        .from('cloud_memories')
        .insert({
          user_id: user.id,
          platform,
          account_label: labelValue,
          content: parsedContent,
          checksum: newChecksum,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: '保存失败' },
          { status: 500 }
        )
      }
      
      // 创建初始版本
      await supabase
        .from('memory_versions')
        .insert({
          cloud_memory_id: newMemory.id,
          version_number: 1,
          content: parsedContent,
          diff: null,
          created_by: 'sync'
        })
      
      return NextResponse.json({
        success: true,
        cloud_memory_id: newMemory.id,
        version_number: 1,
        action: 'created'
      })
    }
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: '同步失败' },
      { status: 500 }
    )
  }
}
