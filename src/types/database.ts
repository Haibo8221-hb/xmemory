export type Platform = 'chatgpt' | 'claude' | 'gemini'
export type MemoryStatus = 'active' | 'draft' | 'removed'
export type OrderStatus = 'pending' | 'completed' | 'refunded'
export type ContentType = 'memory' | 'skill' | 'profile'

// Content type metadata
export const CONTENT_TYPES = [
  { 
    value: 'memory' as ContentType, 
    label: 'Memory', 
    labelZh: '记忆',
    emoji: '🧠',
    description: 'AI对话记忆，个性化设置',
    descriptionZh: 'AI对话记忆，个性化设置',
    acceptFormats: '.json,.txt',
    formatHint: 'JSON (ChatGPT导出格式) 或 TXT',
  },
  { 
    value: 'skill' as ContentType, 
    label: 'Skill', 
    labelZh: '技能',
    emoji: '⚡',
    description: 'Specialized prompts and instructions',
    descriptionZh: '专业提示词和指令集',
    acceptFormats: '.md,.txt,.zip',
    formatHint: 'Markdown (SKILL.md) 或 ZIP 包',
  },
  { 
    value: 'profile' as ContentType, 
    label: 'Profile', 
    labelZh: '角色',
    emoji: '👤',
    description: 'AI persona and character settings',
    descriptionZh: 'AI人设和角色配置',
    acceptFormats: '.json,.yaml,.yml,.txt,.md',
    formatHint: 'JSON / YAML / Markdown / TXT',
  },
] as const

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  stripe_account_id: string | null
  is_verified: boolean
  sales_count: number
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  seller_id: string
  title: string
  description: string | null
  category: string | null
  subcategory: string | null
  tags: string[]
  price: number
  file_path: string
  preview_content: string | null
  platform: Platform
  content_type: ContentType
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

// Subcategories for each category
export const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
  programming: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'python', label: 'Python' },
    { value: 'rust', label: 'Rust' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
    { value: 'java', label: 'Java' },
    { value: 'mobile', label: '移动开发' },
    { value: 'backend', label: '后端开发' },
    { value: 'devops', label: 'DevOps' },
    { value: 'other', label: '其他' },
  ],
  writing: [
    { value: 'copywriting', label: '文案' },
    { value: 'novel', label: '小说' },
    { value: 'blog', label: '博客' },
    { value: 'academic', label: '学术写作' },
    { value: 'translation', label: '翻译' },
    { value: 'other', label: '其他' },
  ],
  design: [
    { value: 'ui', label: 'UI设计' },
    { value: 'ux', label: 'UX设计' },
    { value: 'logo', label: 'Logo设计' },
    { value: 'illustration', label: '插画' },
    { value: 'other', label: '其他' },
  ],
  business: [
    { value: 'startup', label: '创业' },
    { value: 'consulting', label: '咨询' },
    { value: 'finance', label: '金融' },
    { value: 'strategy', label: '战略' },
    { value: 'other', label: '其他' },
  ],
  learning: [
    { value: 'language', label: '语言学习' },
    { value: 'math', label: '数学' },
    { value: 'science', label: '科学' },
    { value: 'exam', label: '考试备考' },
    { value: 'other', label: '其他' },
  ],
  lifestyle: [
    { value: 'cooking', label: '烹饪' },
    { value: 'fitness', label: '健身' },
    { value: 'travel', label: '旅行' },
    { value: 'parenting', label: '育儿' },
    { value: 'other', label: '其他' },
  ],
  marketing: [
    { value: 'seo', label: 'SEO' },
    { value: 'social', label: '社交媒体' },
    { value: 'ads', label: '广告投放' },
    { value: 'content', label: '内容营销' },
    { value: 'other', label: '其他' },
  ],
  research: [
    { value: 'data', label: '数据分析' },
    { value: 'market', label: '市场调研' },
    { value: 'academic', label: '学术研究' },
    { value: 'other', label: '其他' },
  ],
  other: [],
}
