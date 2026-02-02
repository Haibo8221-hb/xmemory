/**
 * Privacy Detector - Scans memory content for sensitive information
 */

export interface PrivacyIssue {
  type: 'high' | 'medium' | 'low'
  category: string
  pattern: string
  match: string
  suggestion: string
  position?: { start: number; end: number }
}

export interface PrivacyScanResult {
  score: number // 0-100, 100 is safest
  issues: PrivacyIssue[]
  entities: {
    names: string[]
    locations: string[]
    organizations: string[]
    dates: string[]
    emails: string[]
    phones: string[]
  }
}

// Privacy detection patterns
const PATTERNS = {
  // High risk - should definitely be removed
  high: [
    {
      category: 'bank_card',
      pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/g,
      name: '银行卡号',
      suggestion: '删除或替换为"银行卡****1234"格式'
    },
    {
      category: 'ssn',
      pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
      name: '社会安全号/身份证',
      suggestion: '立即删除此敏感信息'
    },
    {
      category: 'china_id',
      pattern: /\b[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g,
      name: '中国身份证号',
      suggestion: '立即删除此敏感信息'
    },
    {
      category: 'password',
      pattern: /(?:密码|password|passwd|pwd)[\s:：]*[\S]{4,}/gi,
      name: '密码信息',
      suggestion: '删除密码相关内容'
    },
    {
      category: 'api_key',
      pattern: /(?:api[_-]?key|secret[_-]?key|access[_-]?token)[\s:：]*[\w\-]{20,}/gi,
      name: 'API密钥',
      suggestion: '删除API密钥'
    },
  ],
  // Medium risk - should consider removing
  medium: [
    {
      category: 'email',
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      name: '邮箱地址',
      suggestion: '考虑模糊化为"xxx@example.com"'
    },
    {
      category: 'phone',
      pattern: /(?:\+?86)?1[3-9]\d{9}|\+?1[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      name: '电话号码',
      suggestion: '考虑模糊化为"138****1234"'
    },
    {
      category: 'address',
      pattern: /(?:住在|地址|位于|located at|lives? (?:in|at))[\s:：]*.{5,50}(?:路|街|区|市|省|号|室|栋|building|street|road|avenue|city)/gi,
      name: '家庭地址',
      suggestion: '模糊化为城市级别，如"上海"'
    },
    {
      category: 'company',
      pattern: /(?:在|工作于|就职于|works? (?:at|for))[\s:：]*[\u4e00-\u9fa5A-Za-z\s]{2,20}(?:公司|集团|科技|有限|Inc|Corp|LLC|Ltd)/gi,
      name: '公司名称',
      suggestion: '考虑模糊化为"某科技公司"'
    },
  ],
  // Low risk - informational
  low: [
    {
      category: 'age',
      pattern: /(?:今年|年龄|岁|years? old|age)[\s:：]*\d{1,3}/gi,
      name: '年龄信息',
      suggestion: '可选择保留或删除'
    },
    {
      category: 'birthday',
      pattern: /(?:生日|出生|birthday|born)[\s:：]*\d{4}[-/年]\d{1,2}[-/月]\d{1,2}/gi,
      name: '生日信息',
      suggestion: '可选择保留或删除'
    },
  ]
}

// Entity extraction patterns
const ENTITY_PATTERNS = {
  names: /(?:我(?:叫|是|的名字是)|(?:name is|I'm|I am))[\s:：]*([^\s,，。.]{2,10})/gi,
  locations: /(?:住在|在|位于|来自|located in|live in|from)[\s:：]*([\u4e00-\u9fa5]{2,10}(?:市|省|区|县|镇)?|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/gi,
  organizations: /([\u4e00-\u9fa5]{2,15}(?:公司|集团|大学|学校|医院|银行)|[A-Z][a-zA-Z\s]{2,30}(?:Inc|Corp|University|Company|Bank))/g,
  dates: /(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?|\d{1,2}[-/]\d{1,2}[-/]\d{4})/g,
  emails: /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/g,
  phones: /((?:\+?86)?1[3-9]\d{9}|\+?1[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g,
}

export function scanPrivacy(content: string): PrivacyScanResult {
  const issues: PrivacyIssue[] = []
  
  // Scan for high risk patterns
  for (const pattern of PATTERNS.high) {
    const matches = content.match(pattern.pattern)
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: 'high',
          category: pattern.category,
          pattern: pattern.name,
          match: maskSensitiveData(match),
          suggestion: pattern.suggestion
        })
      }
    }
  }
  
  // Scan for medium risk patterns
  for (const pattern of PATTERNS.medium) {
    const matches = content.match(pattern.pattern)
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: 'medium',
          category: pattern.category,
          pattern: pattern.name,
          match: maskSensitiveData(match),
          suggestion: pattern.suggestion
        })
      }
    }
  }
  
  // Scan for low risk patterns
  for (const pattern of PATTERNS.low) {
    const matches = content.match(pattern.pattern)
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: 'low',
          category: pattern.category,
          pattern: pattern.name,
          match: match,
          suggestion: pattern.suggestion
        })
      }
    }
  }
  
  // Extract entities
  const entities = {
    names: extractUnique(content, ENTITY_PATTERNS.names),
    locations: extractUnique(content, ENTITY_PATTERNS.locations),
    organizations: extractUnique(content, ENTITY_PATTERNS.organizations),
    dates: extractUnique(content, ENTITY_PATTERNS.dates),
    emails: extractUnique(content, ENTITY_PATTERNS.emails),
    phones: extractUnique(content, ENTITY_PATTERNS.phones),
  }
  
  // Calculate privacy score
  const highCount = issues.filter(i => i.type === 'high').length
  const mediumCount = issues.filter(i => i.type === 'medium').length
  const lowCount = issues.filter(i => i.type === 'low').length
  
  let score = 100
  score -= highCount * 25 // Each high risk issue reduces 25 points
  score -= mediumCount * 10 // Each medium risk issue reduces 10 points
  score -= lowCount * 2 // Each low risk issue reduces 2 points
  score = Math.max(0, Math.min(100, score))
  
  return { score, issues, entities }
}

function extractUnique(content: string, pattern: RegExp): string[] {
  const matches: string[] = []
  let match
  while ((match = pattern.exec(content)) !== null) {
    const value = match[1] || match[0]
    if (!matches.includes(value)) {
      matches.push(value)
    }
  }
  return matches
}

function maskSensitiveData(data: string): string {
  if (data.length <= 4) return data
  const visibleChars = Math.min(4, Math.floor(data.length / 4))
  return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars * 2) + data.slice(-visibleChars)
}

// Auto-categorize memory content
export function categorizeMemory(content: string): { category: string; subcategory?: string; tags: string[] } {
  const contentLower = content.toLowerCase()
  const tags: string[] = []
  
  // Category detection rules
  const categories = [
    { 
      category: 'work', 
      keywords: ['工作', '职业', '公司', '同事', '会议', 'work', 'job', 'career', 'meeting', 'colleague', 'project'],
      subcategories: {
        'tech': ['编程', '代码', 'code', 'programming', 'developer', '工程师'],
        'management': ['管理', '领导', 'manager', 'lead', 'team'],
        'design': ['设计', 'design', 'ui', 'ux', 'figma'],
      }
    },
    { 
      category: 'personal', 
      keywords: ['家庭', '朋友', '爱好', '宠物', 'family', 'friend', 'hobby', 'pet', '生活'],
      subcategories: {
        'family': ['家人', '父母', '孩子', 'family', 'parent', 'child'],
        'hobby': ['爱好', '兴趣', 'hobby', 'interest', '喜欢'],
      }
    },
    { 
      category: 'learning', 
      keywords: ['学习', '课程', '教育', '学校', 'learning', 'study', 'course', 'school', 'education'],
      subcategories: {
        'language': ['语言', '英语', '日语', 'language', 'english'],
        'skill': ['技能', '技术', 'skill', 'tech'],
      }
    },
    { 
      category: 'health', 
      keywords: ['健康', '运动', '医疗', 'health', 'fitness', 'exercise', 'medical', '健身'],
      subcategories: {
        'fitness': ['健身', '运动', 'fitness', 'exercise', 'gym'],
        'diet': ['饮食', '食物', 'diet', 'food', 'nutrition'],
      }
    },
    { 
      category: 'finance', 
      keywords: ['财务', '投资', '理财', 'finance', 'investment', 'money', 'budget', '收入'],
      subcategories: {}
    },
    {
      category: 'preferences',
      keywords: ['偏好', '喜欢', '习惯', 'prefer', 'like', 'style', '风格'],
      subcategories: {
        'communication': ['沟通', '回复', 'communication', 'reply', 'style'],
        'tool': ['工具', '软件', 'tool', 'software', 'app'],
      }
    }
  ]
  
  let detectedCategory = 'other'
  let detectedSubcategory: string | undefined
  
  for (const cat of categories) {
    const hasKeyword = cat.keywords.some(kw => contentLower.includes(kw))
    if (hasKeyword) {
      detectedCategory = cat.category
      
      // Check subcategories
      for (const [subcat, subKeywords] of Object.entries(cat.subcategories)) {
        if ((subKeywords as string[]).some((kw: string) => contentLower.includes(kw))) {
          detectedSubcategory = subcat
          break
        }
      }
      
      // Extract tags from keywords found
      for (const kw of cat.keywords) {
        if (contentLower.includes(kw) && !tags.includes(kw)) {
          tags.push(kw)
        }
      }
      
      break
    }
  }
  
  return { category: detectedCategory, subcategory: detectedSubcategory, tags: tags.slice(0, 5) }
}
