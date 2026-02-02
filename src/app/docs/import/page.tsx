'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Bot, Sparkles, Brain, ExternalLink, ChevronDown, ChevronUp,
  Upload, Settings, Copy, Check, ArrowRight, FileJson, ClipboardPaste
} from 'lucide-react'

type Platform = 'chatgpt' | 'claude' | 'gemini'

export default function ImportGuidePage() {
  const { locale } = useTranslation()
  const [expandedPlatform, setExpandedPlatform] = useState<Platform>('chatgpt')
  const [copiedCode, setCopiedCode] = useState(false)
  
  const texts = {
    en: {
      title: 'How to Import AI Memory',
      subtitle: 'Use your xmemory content across different AI platforms',
      
      importToXmemory: 'Import to xmemory',
      importToXmemoryDesc: 'First, bring your memories into xmemory for organization',
      importMethods: [
        { icon: FileJson, title: 'Upload JSON File', desc: 'Upload exported JSON from ChatGPT or other platforms' },
        { icon: ClipboardPaste, title: 'Paste Text', desc: 'Directly paste memory content or instructions' },
      ],
      startImport: 'Start Import Wizard',
      
      exportFromXmemory: 'Export from xmemory to AI Platforms',
      exportDesc: 'Copy your organized memories to use in different AI assistants',
      selectPlatform: 'Select target platform',
      
      // ChatGPT
      chatgptTitle: 'Import to ChatGPT',
      chatgptDesc: 'Add memories to ChatGPT\'s personalization',
      chatgptSteps: [
        { title: 'Copy from xmemory', desc: 'Export your Memory/Skill from xmemory as text' },
        { title: 'Open ChatGPT Settings', desc: 'Click your profile → Settings → Personalization' },
        { title: 'Add Custom Instructions', desc: 'Paste your content into "Custom Instructions" or "What would you like ChatGPT to know about you?"' },
        { title: 'Save Changes', desc: 'Click Save - your settings will apply to all new conversations' },
      ],
      chatgptTips: [
        'Custom Instructions have a character limit (~1500 chars each field)',
        'For longer content, use the ChatGPT Memory feature to add facts one by one',
        'Skills work great as "How would you like ChatGPT to respond?" instructions',
      ],
      chatgptFormat: `// Example Custom Instructions format:
      
About me:
- I'm a software developer focusing on React and TypeScript
- I prefer concise, practical explanations
- I work in a startup environment

Response style:
- Use code examples when explaining
- Prefer modern ES6+ syntax
- Include error handling in examples`,

      // Claude
      claudeTitle: 'Import to Claude',
      claudeDesc: 'Set up Claude Projects with your xmemory content',
      claudeSteps: [
        { title: 'Create a New Project', desc: 'Go to claude.ai → Projects → Create new project' },
        { title: 'Set Project Instructions', desc: 'Paste your xmemory Skill as the project instructions' },
        { title: 'Add Knowledge (Optional)', desc: 'Upload any reference documents to the Knowledge section' },
        { title: 'Start Chatting', desc: 'Open a chat within the project - Claude will follow your instructions' },
      ],
      claudeTips: [
        'Project Instructions are like persistent system prompts',
        'Create different projects for different xmemory Profiles (Work, Personal, etc.)',
        'Claude\'s context window is large - you can include detailed instructions',
      ],
      claudeFormat: `// Example Claude Project Instructions:

You are my personal coding assistant. Here's what you should know:

## My Background
- Senior React developer with 5 years experience
- Currently building a SaaS product
- Tech stack: Next.js, TypeScript, Tailwind, Supabase

## My Preferences
- Prefer functional components with hooks
- Always use TypeScript with strict mode
- Follow Airbnb style guide
- Include comprehensive error handling

## Response Guidelines
- Keep explanations concise
- Always show code examples
- Suggest best practices and potential pitfalls`,

      // Gemini
      geminiTitle: 'Import to Gemini',
      geminiDesc: 'Create Gems with your xmemory configuration',
      geminiSteps: [
        { title: 'Open Gem Manager', desc: 'Go to gemini.google.com → Gem manager' },
        { title: 'Create New Gem', desc: 'Click "New Gem" and give it a name matching your xmemory Skill' },
        { title: 'Add Instructions', desc: 'Paste your xmemory content as the Gem\'s system instructions' },
        { title: 'Save and Use', desc: 'Save the Gem and start a conversation with it' },
      ],
      geminiTips: [
        'Gems are perfect for xmemory Skills - each Skill = one Gem',
        'You can share Gems with others (like sharing xmemory Skills)',
        'Combine multiple Skills by creating comprehensive Gem instructions',
      ],
      geminiFormat: `// Example Gemini Gem Instructions:

Name: Code Review Expert
Description: Reviews code with focus on best practices and security

Instructions:
You are an expert code reviewer. When I share code:

1. Check for security vulnerabilities
2. Identify performance issues  
3. Suggest cleaner alternatives
4. Point out missing error handling
5. Recommend relevant best practices

Always explain WHY something should be changed, not just WHAT.
Format suggestions as actionable items with code examples.`,

      // Common
      formatTip: 'Recommended Format',
      copyFormat: 'Copy Template',
      copied: 'Copied!',
      
      backToExport: '← Back to Export Guide',
      tryImport: 'Try Import Wizard',
    },
    zh: {
      title: '如何导入 AI 记忆',
      subtitle: '在不同 AI 平台使用你的 xmemory 内容',
      
      importToXmemory: '导入到 xmemory',
      importToXmemoryDesc: '首先，把你的记忆导入 xmemory 进行整理',
      importMethods: [
        { icon: FileJson, title: '上传 JSON 文件', desc: '上传从 ChatGPT 或其他平台导出的 JSON' },
        { icon: ClipboardPaste, title: '粘贴文本', desc: '直接粘贴记忆内容或指令' },
      ],
      startImport: '开始导入向导',
      
      exportFromXmemory: '从 xmemory 导出到 AI 平台',
      exportDesc: '复制整理好的记忆到不同的 AI 助手使用',
      selectPlatform: '选择目标平台',
      
      // ChatGPT
      chatgptTitle: '导入到 ChatGPT',
      chatgptDesc: '把记忆添加到 ChatGPT 的个性化设置',
      chatgptSteps: [
        { title: '从 xmemory 复制', desc: '导出你的 Memory/Skill 为文本格式' },
        { title: '打开 ChatGPT 设置', desc: '点击头像 → Settings → Personalization' },
        { title: '添加自定义指令', desc: '将内容粘贴到 "Custom Instructions" 或 "What would you like ChatGPT to know about you?"' },
        { title: '保存更改', desc: '点击 Save - 设置将应用于所有新对话' },
      ],
      chatgptTips: [
        'Custom Instructions 每个字段有字符限制（约1500字符）',
        '更长的内容可以用 ChatGPT Memory 功能逐条添加',
        'Skills 非常适合作为 "How would you like ChatGPT to respond?" 指令',
      ],
      chatgptFormat: `// 自定义指令格式示例:

关于我：
- 我是专注于 React 和 TypeScript 的软件开发者
- 我喜欢简洁、实用的解释
- 我在创业公司工作

回复风格：
- 解释时使用代码示例
- 优先使用现代 ES6+ 语法
- 示例中包含错误处理`,

      // Claude
      claudeTitle: '导入到 Claude',
      claudeDesc: '用 xmemory 内容设置 Claude Projects',
      claudeSteps: [
        { title: '创建新项目', desc: '访问 claude.ai → Projects → 创建新项目' },
        { title: '设置项目指令', desc: '将 xmemory Skill 粘贴为项目指令' },
        { title: '添加知识库（可选）', desc: '将参考文档上传到 Knowledge 部分' },
        { title: '开始对话', desc: '在项目中打开对话 - Claude 会遵循你的指令' },
      ],
      claudeTips: [
        'Project Instructions 类似于持久的系统提示',
        '为不同的 xmemory Profiles 创建不同项目（工作、个人等）',
        'Claude 的上下文窗口很大 - 可以包含详细指令',
      ],
      claudeFormat: `// Claude 项目指令示例:

你是我的个人编程助手。以下是你需要了解的：

## 我的背景
- 5年经验的资深 React 开发者
- 目前在构建 SaaS 产品
- 技术栈：Next.js, TypeScript, Tailwind, Supabase

## 我的偏好
- 优先使用函数组件和 Hooks
- 始终使用 TypeScript 严格模式
- 遵循 Airbnb 代码风格
- 包含完善的错误处理

## 回复指南
- 解释保持简洁
- 始终展示代码示例
- 建议最佳实践和潜在陷阱`,

      // Gemini
      geminiTitle: '导入到 Gemini',
      geminiDesc: '用 xmemory 配置创建 Gems',
      geminiSteps: [
        { title: '打开 Gem 管理器', desc: '访问 gemini.google.com → Gem manager' },
        { title: '创建新 Gem', desc: '点击 "New Gem"，命名与 xmemory Skill 对应' },
        { title: '添加指令', desc: '将 xmemory 内容粘贴为 Gem 的系统指令' },
        { title: '保存并使用', desc: '保存 Gem 并开始对话' },
      ],
      geminiTips: [
        'Gems 非常适合 xmemory Skills - 每个 Skill = 一个 Gem',
        '你可以与他人分享 Gems（就像分享 xmemory Skills）',
        '通过创建综合 Gem 指令来组合多个 Skills',
      ],
      geminiFormat: `// Gemini Gem 指令示例:

名称：代码审查专家
描述：审查代码，专注于最佳实践和安全性

指令：
你是一个专业的代码审查员。当我分享代码时：

1. 检查安全漏洞
2. 识别性能问题
3. 建议更简洁的替代方案
4. 指出缺失的错误处理
5. 推荐相关最佳实践

始终解释为什么要修改，而不仅仅是修改什么。
将建议格式化为可操作项，附带代码示例。`,

      // Common
      formatTip: '推荐格式',
      copyFormat: '复制模板',
      copied: '已复制！',
      
      backToExport: '← 返回导出指南',
      tryImport: '试试导入向导',
    }
  }
  
  const txt = texts[locale] || texts.zh

  const platforms = [
    { id: 'chatgpt' as Platform, icon: Bot, color: 'from-green-500 to-emerald-600', title: txt.chatgptTitle, desc: txt.chatgptDesc, steps: txt.chatgptSteps, tips: txt.chatgptTips, format: txt.chatgptFormat },
    { id: 'claude' as Platform, icon: Sparkles, color: 'from-orange-500 to-amber-600', title: txt.claudeTitle, desc: txt.claudeDesc, steps: txt.claudeSteps, tips: txt.claudeTips, format: txt.claudeFormat },
    { id: 'gemini' as Platform, icon: Brain, color: 'from-blue-500 to-indigo-600', title: txt.geminiTitle, desc: txt.geminiDesc, steps: txt.geminiSteps, tips: txt.geminiTips, format: txt.geminiFormat },
  ]

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{txt.title}</h1>
        <p className="text-gray-500 text-lg">{txt.subtitle}</p>
      </div>

      {/* Import to xmemory Section */}
      <Card className="mb-12 bg-gradient-to-br from-purple-50 to-pink-50 border-0">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-2">{txt.importToXmemory}</h2>
          <p className="text-gray-600 mb-6">{txt.importToXmemoryDesc}</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {txt.importMethods.map((method, i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <method.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">{method.title}</h3>
                  <p className="text-sm text-gray-500">{method.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/import">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 border-0">
              {txt.startImport}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Export from xmemory to Platforms */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">{txt.exportFromXmemory}</h2>
        <p className="text-gray-600 mb-6">{txt.exportDesc}</p>
      </div>
      
      <p className="text-sm font-medium text-gray-500 mb-4">{txt.selectPlatform}</p>
      
      <div className="space-y-4">
        {platforms.map((platform) => (
          <Card 
            key={platform.id}
            className={`overflow-hidden transition-all ${expandedPlatform === platform.id ? 'ring-2 ring-purple-500' : ''}`}
          >
            {/* Platform Header */}
            <button
              onClick={() => setExpandedPlatform(platform.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                  <platform.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{platform.title}</h3>
                  <p className="text-sm text-gray-500">{platform.desc}</p>
                </div>
              </div>
              {expandedPlatform === platform.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {/* Expanded Content */}
            {expandedPlatform === platform.id && (
              <CardContent className="border-t bg-gray-50 p-6">
                {/* Steps */}
                <div className="space-y-4 mb-6">
                  {platform.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${platform.color} text-white flex items-center justify-center flex-shrink-0 text-sm font-bold`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Format Example */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{txt.formatTip}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(platform.format)}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          {txt.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          {txt.copyFormat}
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-x-auto">
                    {platform.format}
                  </pre>
                </div>
                
                {/* Tips */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {platform.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between">
        <Link href="/docs/export" className="text-purple-600 hover:text-purple-700 font-medium">
          {txt.backToExport}
        </Link>
        <Link href="/import">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-500 border-0">
            {txt.tryImport}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
