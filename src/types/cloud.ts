// Cloud Memory Types for xmemory v2.0

export type CloudPlatform = 'chatgpt' | 'claude' | 'gemini'
export type SyncStatus = 'synced' | 'pending' | 'conflict'
export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise'

// Cloud Memory - 用户的云端 Memory 备份
export interface CloudMemory {
  id: string
  user_id: string
  platform: CloudPlatform
  account_label: string | null      // 用户自定义标签，如 "工作账号"
  content: MemoryContent
  checksum: string                  // MD5 用于冲突检测
  sync_status: SyncStatus
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

// Memory 内容结构
export interface MemoryContent {
  raw: string                       // 原始 JSON 字符串
  items: MemoryItem[]               // 解析后的条目
  metadata?: {
    exported_at?: string
    source_version?: string
  }
}

// 单条 Memory 条目
export interface MemoryItem {
  id?: string
  key: string
  value: string
  category?: string                 // 用户自定义分类
  tags?: string[]
  created_at?: string
  updated_at?: string
}

// 版本历史
export interface MemoryVersion {
  id: string
  cloud_memory_id: string
  version_number: number
  content: MemoryContent
  diff: VersionDiff | null          // 与上一版本的差异
  created_at: string
  created_by?: string               // 'auto' | 'manual' | 'sync'
}

// 版本差异
export interface VersionDiff {
  added: MemoryItem[]
  removed: MemoryItem[]
  modified: {
    before: MemoryItem
    after: MemoryItem
  }[]
  summary: string                   // 如 "+3 条, -1 条, 修改 2 条"
}

// 团队相关
export interface Team {
  id: string
  name: string
  owner_id: string
  plan: SubscriptionPlan
  member_count: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  joined_at: string
  user?: {
    id: string
    email: string
    username: string | null
  }
}

export interface TeamMemory {
  id: string
  team_id: string
  title: string
  description: string | null
  content: MemoryContent
  platform: CloudPlatform
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
  creator?: {
    username: string | null
    avatar_url: string | null
  }
}

// 用户订阅信息
export interface UserSubscription {
  user_id: string
  plan: SubscriptionPlan
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  
  // 配额
  max_cloud_accounts: number        // 最大 AI 账号数
  max_version_days: number          // 版本历史保留天数
  max_team_members?: number         // 团队最大成员数
}

// API 请求/响应类型
export interface SyncRequest {
  platform: CloudPlatform
  account_label?: string
  content: string                   // 原始 Memory JSON
  force?: boolean                   // 强制覆盖
}

export interface SyncResponse {
  success: boolean
  cloud_memory_id: string
  version_number: number
  conflict?: {
    local_checksum: string
    remote_checksum: string
    remote_updated_at: string
  }
}

export interface RestoreRequest {
  cloud_memory_id: string
  version_number: number
}

// 配额限制
export const PLAN_LIMITS: Record<SubscriptionPlan, {
  max_accounts: number
  version_days: number
  max_versions: number
  cloud_sync: boolean
  team_features: boolean
  api_access: boolean
}> = {
  free: {
    max_accounts: 1,
    version_days: 7,
    max_versions: 10,
    cloud_sync: false,
    team_features: false,
    api_access: false,
  },
  pro: {
    max_accounts: 5,
    version_days: 90,
    max_versions: 100,
    cloud_sync: true,
    team_features: false,
    api_access: false,
  },
  team: {
    max_accounts: -1,  // unlimited
    version_days: 365,
    max_versions: -1,  // unlimited
    cloud_sync: true,
    team_features: true,
    api_access: true,
  },
  enterprise: {
    max_accounts: -1,
    version_days: -1,
    max_versions: -1,
    cloud_sync: true,
    team_features: true,
    api_access: true,
  },
}
