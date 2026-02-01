// Cloud Memory 工具函数
import crypto from 'crypto'
import type { MemoryContent, MemoryItem, VersionDiff } from '@/types/cloud'

// 计算 Memory 内容的 checksum
export function calculateChecksum(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}

// 解析 Memory JSON 内容
export function parseMemoryContent(raw: string): MemoryContent {
  try {
    const parsed = JSON.parse(raw)
    
    // ChatGPT 格式
    if (Array.isArray(parsed)) {
      return {
        raw,
        items: parsed.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          key: item.key || item.title || `Memory ${index + 1}`,
          value: item.value || item.content || JSON.stringify(item),
          created_at: item.created_at || item.createdAt,
          updated_at: item.updated_at || item.updatedAt,
        })),
        metadata: {
          exported_at: new Date().toISOString(),
        }
      }
    }
    
    // Claude 格式或其他格式
    if (parsed.memories && Array.isArray(parsed.memories)) {
      return {
        raw,
        items: parsed.memories.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          key: item.key || item.title || `Memory ${index + 1}`,
          value: item.value || item.content || JSON.stringify(item),
          created_at: item.created_at,
          updated_at: item.updated_at,
        })),
        metadata: parsed.metadata || {
          exported_at: new Date().toISOString(),
        }
      }
    }
    
    // 单条 Memory 或其他格式
    return {
      raw,
      items: [{
        id: 'item-0',
        key: 'Memory',
        value: raw,
      }],
      metadata: {
        exported_at: new Date().toISOString(),
      }
    }
  } catch (e) {
    // 无法解析，作为纯文本处理
    return {
      raw,
      items: [{
        id: 'item-0',
        key: 'Memory',
        value: raw,
      }],
      metadata: {
        exported_at: new Date().toISOString(),
      }
    }
  }
}

// 计算两个版本之间的差异
export function calculateDiff(
  oldContent: MemoryContent, 
  newContent: MemoryContent
): VersionDiff {
  const oldItems = new Map(oldContent.items.map(item => [item.key, item]))
  const newItems = new Map(newContent.items.map(item => [item.key, item]))
  
  const added: MemoryItem[] = []
  const removed: MemoryItem[] = []
  const modified: { before: MemoryItem; after: MemoryItem }[] = []
  
  // 找新增和修改的
  for (const [key, newItem] of newItems) {
    const oldItem = oldItems.get(key)
    if (!oldItem) {
      added.push(newItem)
    } else if (oldItem.value !== newItem.value) {
      modified.push({ before: oldItem, after: newItem })
    }
  }
  
  // 找删除的
  for (const [key, oldItem] of oldItems) {
    if (!newItems.has(key)) {
      removed.push(oldItem)
    }
  }
  
  // 生成摘要
  const parts: string[] = []
  if (added.length > 0) parts.push(`+${added.length}`)
  if (removed.length > 0) parts.push(`-${removed.length}`)
  if (modified.length > 0) parts.push(`~${modified.length}`)
  
  return {
    added,
    removed,
    modified,
    summary: parts.length > 0 ? parts.join(', ') : '无变化'
  }
}

// 获取用户的订阅计划限制
export function getPlanLimits(plan: string) {
  const limits = {
    free: {
      max_accounts: 1,
      version_days: 7,
      max_versions: 10,
      cloud_sync: false,
    },
    pro: {
      max_accounts: 5,
      version_days: 90,
      max_versions: 100,
      cloud_sync: true,
    },
    team: {
      max_accounts: -1,
      version_days: 365,
      max_versions: -1,
      cloud_sync: true,
    },
    enterprise: {
      max_accounts: -1,
      version_days: -1,
      max_versions: -1,
      cloud_sync: true,
    },
  }
  
  return limits[plan as keyof typeof limits] || limits.free
}

// 清理过期版本
export async function cleanupOldVersions(
  supabase: any,
  cloudMemoryId: string,
  maxVersions: number,
  maxDays: number
) {
  if (maxVersions === -1 && maxDays === -1) {
    return // 无限制
  }
  
  // 删除超过数量限制的版本
  if (maxVersions > 0) {
    const { data: versions } = await supabase
      .from('memory_versions')
      .select('id, version_number')
      .eq('cloud_memory_id', cloudMemoryId)
      .order('version_number', { ascending: false })
    
    if (versions && versions.length > maxVersions) {
      const toDelete = versions.slice(maxVersions).map((v: any) => v.id)
      await supabase
        .from('memory_versions')
        .delete()
        .in('id', toDelete)
    }
  }
  
  // 删除超过时间限制的版本
  if (maxDays > 0) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxDays)
    
    await supabase
      .from('memory_versions')
      .delete()
      .eq('cloud_memory_id', cloudMemoryId)
      .lt('created_at', cutoffDate.toISOString())
  }
}
