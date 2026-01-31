export type Platform = 'chatgpt' | 'claude' | 'gemini'
export type MemoryStatus = 'active' | 'draft' | 'removed'
export type OrderStatus = 'pending' | 'completed' | 'refunded'

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  stripe_account_id: string | null
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  seller_id: string
  title: string
  description: string | null
  category: string | null
  tags: string[]
  price: number
  file_path: string
  preview_content: string | null
  platform: Platform
  download_count: number
  rating_avg: number | null
  rating_count: number
  status: MemoryStatus
  created_at: string
  updated_at: string
  // Joined fields
  seller?: Profile
}

export interface Order {
  id: string
  buyer_id: string
  memory_id: string
  amount: number
  platform_fee: number
  seller_amount: number
  stripe_payment_id: string | null
  status: OrderStatus
  created_at: string
  // Joined fields
  memory?: Memory
  buyer?: Profile
}

export interface Review {
  id: string
  order_id: string
  buyer_id: string
  memory_id: string
  rating: number
  comment: string | null
  seller_reply: string | null
  created_at: string
  // Joined fields
  buyer?: Profile
}

// Categories for memories
export const CATEGORIES = [
  { value: 'programming', label: '编程开发', emoji: '💻' },
  { value: 'writing', label: '写作创作', emoji: '✍️' },
  { value: 'design', label: '设计', emoji: '🎨' },
  { value: 'business', label: '商业', emoji: '💼' },
  { value: 'learning', label: '学习教育', emoji: '📚' },
  { value: 'lifestyle', label: '生活', emoji: '🏠' },
  { value: 'marketing', label: '营销', emoji: '📢' },
  { value: 'research', label: '研究分析', emoji: '🔬' },
  { value: 'other', label: '其他', emoji: '📦' },
] as const

export type Category = typeof CATEGORIES[number]['value']
