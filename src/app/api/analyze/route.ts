import { NextRequest, NextResponse } from 'next/server'
import { CATEGORIES, CONTENT_TYPES } from '@/types/database'

// Simple content analysis without external AI API
// Can be enhanced with OpenAI/Claude later
function analyzeContent(content: string, filename: string) {
  const lowerContent = content.toLowerCase()
  const lowerFilename = filename.toLowerCase()
  
  // Detect content type from filename
  let contentType = 'memory'
  if (lowerFilename.endsWith('.skill') || lowerFilename.includes('skill')) {
    contentType = 'skill'
  } else if (lowerFilename.includes('profile') || lowerFilename.includes('persona') || lowerFilename.includes('character')) {
    contentType = 'profile'
  }
  
  // Detect platform
  let platform = 'chatgpt'
  if (lowerContent.includes('claude') || lowerFilename.includes('claude')) {
    platform = 'claude'
  } else if (lowerContent.includes('gemini') || lowerFilename.includes('gemini')) {
    platform = 'gemini'
  }
  
  // Detect category based on keywords
  const categoryKeywords: Record<string, string[]> = {
    programming: ['code', 'coding', 'programming', 'developer', 'react', 'python', 'javascript', 'typescript', 'api', 'database', 'function', 'class', 'algorithm', '编程', '代码', '开发'],
    writing: ['write', 'writing', 'article', 'blog', 'story', 'novel', 'content', 'copywriting', 'translation', '写作', '文章', '博客', '文案', '翻译'],
    design: ['design', 'ui', 'ux', 'logo', 'color', 'layout', 'figma', 'sketch', '设计', '界面', '配色'],
    business: ['business', 'startup', 'company', 'market', 'strategy', 'finance', 'investment', '商业', '创业', '公司', '市场', '战略'],
    learning: ['learn', 'study', 'education', 'course', 'exam', 'language', 'math', 'science', '学习', '教育', '课程', '考试'],
    lifestyle: ['life', 'health', 'fitness', 'cooking', 'travel', 'home', '生活', '健康', '健身', '烹饪', '旅行'],
    marketing: ['marketing', 'seo', 'ads', 'advertising', 'social media', 'campaign', '营销', '推广', '广告'],
    research: ['research', 'analysis', 'data', 'report', 'study', '研究', '分析', '数据', '报告'],
  }
  
  let detectedCategory = 'other'
  let maxScore = 0
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        score++
      }
    }
    if (score > maxScore) {
      maxScore = score
      detectedCategory = category
    }
  }
  
  // Generate title from filename or content
  let title = filename.replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Title case
  
  // If title is too generic, try to extract from content
  if (title.length < 5 || ['Memory', 'Export', 'Data'].includes(title)) {
    // Try to find a meaningful first line
    const lines = content.split('\n').filter(l => l.trim().length > 10)
    if (lines.length > 0) {
      const firstLine = lines[0].trim()
      if (firstLine.length > 5 && firstLine.length < 100) {
        title = firstLine.replace(/^[#\-*\s]+/, '').slice(0, 60)
      }
    }
  }
  
  // Generate description from content summary
  let description = ''
  const textContent = content.replace(/[{}\[\]"':,]/g, ' ').replace(/\s+/g, ' ').trim()
  if (textContent.length > 50) {
    description = textContent.slice(0, 200) + (textContent.length > 200 ? '...' : '')
  }
  
  // Extract potential tags
  const tags: string[] = []
  const tagPatterns = [
    /react|vue|angular|node|python|java|rust|go|typescript|javascript/gi,
    /chatgpt|claude|gemini|openai|anthropic/gi,
    /writing|coding|design|business|marketing/gi,
  ]
  
  for (const pattern of tagPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(m => {
        const tag = m.toLowerCase()
        if (!tags.includes(tag)) tags.push(tag)
      })
    }
  }
  
  return {
    contentType,
    platform,
    category: detectedCategory,
    title,
    description,
    tags: tags.slice(0, 5),
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, filename } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }
    
    const analysis = analyzeContent(content, filename || 'memory.txt')
    
    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
