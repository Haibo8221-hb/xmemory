'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Bot, Sparkles, Brain, ExternalLink, ChevronDown, ChevronUp,
  Download, Settings, FolderOpen, MoreHorizontal, Copy, Check
} from 'lucide-react'

type Platform = 'chatgpt' | 'claude' | 'gemini'

export default function ExportGuidePage() {
  const { locale } = useTranslation()
  const [expandedPlatform, setExpandedPlatform] = useState<Platform>('chatgpt')
  const [copiedStep, setCopiedStep] = useState<string | null>(null)
  
  const texts = {
    en: {
      title: 'How to Export AI Memory',
      subtitle: 'Step-by-step guides for exporting your memory from popular AI platforms',
      selectPlatform: 'Select your AI platform',
      
      // ChatGPT
      chatgptTitle: 'ChatGPT Memory',
      chatgptDesc: 'Export your personalization data and conversation memories',
      chatgptSteps: [
        { title: 'Open Settings', desc: 'Click your profile picture in the bottom left corner, then select "Settings"' },
        { title: 'Go to Personalization', desc: 'In the Settings menu, click on "Personalization"' },
        { title: 'Access Memory Manager', desc: 'Click "Manage" next to the Memory section' },
        { title: 'Export Memories', desc: 'Click the "..." menu in the top right, then select "Export memories"' },
        { title: 'Download JSON', desc: 'ChatGPT will generate and download a JSON file containing all your memories' },
      ],
      chatgptTips: [
        'The export includes all remembered facts about you',
        'You can edit the JSON to remove sensitive information before uploading',
        'Memory export is available for ChatGPT Plus and Team users',
      ],
      chatgptLink: 'https://chat.openai.com',
      
      // Claude
      claudeTitle: 'Claude Projects & Knowledge',
      claudeDesc: 'Export your project instructions and uploaded knowledge files',
      claudeSteps: [
        { title: 'Open Claude Projects', desc: 'Go to claude.ai and open your Projects from the sidebar' },
        { title: 'Select a Project', desc: 'Click on the project you want to export' },
        { title: 'Copy Project Instructions', desc: 'Open project settings and copy your custom instructions' },
        { title: 'Download Knowledge Files', desc: 'Go to the Knowledge section and download any uploaded files' },
        { title: 'Save as Text/JSON', desc: 'Paste instructions into a text file or format as JSON for xmemory' },
      ],
      claudeTips: [
        'Claude doesn\'t have a direct "Memory" feature like ChatGPT',
        'Project Instructions act as persistent context for conversations',
        'You can export multiple projects and organize them as Skills in xmemory',
      ],
      claudeLink: 'https://claude.ai',
      
      // Gemini
      geminiTitle: 'Gemini Gems & Extensions',
      geminiDesc: 'Export your custom Gems and extension configurations',
      geminiSteps: [
        { title: 'Open Gemini Advanced', desc: 'Go to gemini.google.com and ensure you\'re using Gemini Advanced' },
        { title: 'Access Your Gems', desc: 'Click on "Gem manager" in the left sidebar' },
        { title: 'Select a Gem', desc: 'Click on the Gem you want to export' },
        { title: 'Copy Instructions', desc: 'Copy the system instructions and any custom settings' },
        { title: 'Save Configuration', desc: 'Create a JSON file with your Gem\'s name, description, and instructions' },
      ],
      geminiTips: [
        'Gems are custom AI personas you can create in Gemini Advanced',
        'Export your most useful Gems to recreate them across platforms',
        'Include any specific knowledge or rules you\'ve defined',
      ],
      geminiLink: 'https://gemini.google.com',
      
      // Common
      whatToExport: 'What Can You Export?',
      memoryLabel: 'Memory',
      memoryDesc: 'Facts the AI remembers about you (preferences, background, style)',
      skillLabel: 'Skills / Instructions',
      skillDesc: 'Custom instructions that define how the AI behaves for specific tasks',
      profileLabel: 'Profiles / Projects',
      profileDesc: 'Complete configurations combining multiple skills for different contexts',
      
      nextStep: 'Next: Import to xmemory',
      importLink: 'Learn how to import →',
    },
    zh: {
      title: '如何导出 AI 记忆',
      subtitle: '主流 AI 平台的 Memory 导出指南',
      selectPlatform: '选择你的 AI 平台',
      
      // ChatGPT
      chatgptTitle: 'ChatGPT Memory',
      chatgptDesc: '导出你的个性化数据和对话记忆',
      chatgptSteps: [
        { title: '打开设置', desc: '点击左下角的头像，选择「Settings」（设置）' },
        { title: '进入个性化', desc: '在设置菜单中，点击「Personalization」（个性化）' },
        { title: '管理 Memory', desc: '点击 Memory 旁边的「Manage」按钮' },
        { title: '导出记忆', desc: '点击右上角的「...」菜单，选择「Export memories」' },
        { title: '下载 JSON', desc: 'ChatGPT 会生成并下载一个包含所有记忆的 JSON 文件' },
      ],
      chatgptTips: [
        '导出内容包含 AI 记住的所有关于你的信息',
        '建议在上传前编辑 JSON 文件，删除敏感信息',
        'Memory 导出功能需要 ChatGPT Plus 或 Team 订阅',
      ],
      chatgptLink: 'https://chat.openai.com',
      
      // Claude
      claudeTitle: 'Claude Projects & Knowledge',
      claudeDesc: '导出你的项目指令和知识库文件',
      claudeSteps: [
        { title: '打开 Claude Projects', desc: '访问 claude.ai，从侧边栏打开 Projects' },
        { title: '选择项目', desc: '点击你要导出的项目' },
        { title: '复制项目指令', desc: '打开项目设置，复制你的自定义指令' },
        { title: '下载知识文件', desc: '进入 Knowledge 部分，下载已上传的文件' },
        { title: '保存为文本/JSON', desc: '将指令粘贴到文本文件或格式化为 JSON 导入 xmemory' },
      ],
      claudeTips: [
        'Claude 没有像 ChatGPT 一样的直接 Memory 功能',
        'Project Instructions 充当对话的持久上下文',
        '你可以导出多个项目，在 xmemory 中组织为不同的 Skills',
      ],
      claudeLink: 'https://claude.ai',
      
      // Gemini
      geminiTitle: 'Gemini Gems & Extensions',
      geminiDesc: '导出你的自定义 Gems 和扩展配置',
      geminiSteps: [
        { title: '打开 Gemini Advanced', desc: '访问 gemini.google.com 并确保使用 Gemini Advanced' },
        { title: '访问 Gems', desc: '点击左侧边栏的「Gem manager」' },
        { title: '选择 Gem', desc: '点击你要导出的 Gem' },
        { title: '复制指令', desc: '复制系统指令和任何自定义设置' },
        { title: '保存配置', desc: '创建包含 Gem 名称、描述和指令的 JSON 文件' },
      ],
      geminiTips: [
        'Gems 是你在 Gemini Advanced 中创建的自定义 AI 人设',
        '导出最有用的 Gems，以便在其他平台重建',
        '包含你定义的任何特定知识或规则',
      ],
      geminiLink: 'https://gemini.google.com',
      
      // Common
      whatToExport: '可以导出什么？',
      memoryLabel: 'Memory 记忆',
      memoryDesc: 'AI 记住的关于你的信息（偏好、背景、风格）',
      skillLabel: 'Skills 技能/指令',
      skillDesc: '定义 AI 在特定任务中行为方式的自定义指令',
      profileLabel: 'Profiles 配置',
      profileDesc: '组合多个 Skills 的完整配置，用于不同场景',
      
      nextStep: '下一步：导入到 xmemory',
      importLink: '了解如何导入 →',
    }
  }
  
  const txt = texts[locale] || texts.zh

  const platforms = [
    { id: 'chatgpt' as Platform, icon: Bot, color: 'from-green-500 to-emerald-600', title: txt.chatgptTitle, desc: txt.chatgptDesc, steps: txt.chatgptSteps, tips: txt.chatgptTips, link: txt.chatgptLink },
    { id: 'claude' as Platform, icon: Sparkles, color: 'from-orange-500 to-amber-600', title: txt.claudeTitle, desc: txt.claudeDesc, steps: txt.claudeSteps, tips: txt.claudeTips, link: txt.claudeLink },
    { id: 'gemini' as Platform, icon: Brain, color: 'from-blue-500 to-indigo-600', title: txt.geminiTitle, desc: txt.geminiDesc, steps: txt.geminiSteps, tips: txt.geminiTips, link: txt.geminiLink },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{txt.title}</h1>
        <p className="text-gray-500 text-lg">{txt.subtitle}</p>
      </div>

      {/* What to Export */}
      <Card className="mb-12 bg-gradient-to-br from-purple-50 to-pink-50 border-0">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-6">{txt.whatToExport}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="font-semibold mb-1">{txt.memoryLabel}</h3>
              <p className="text-sm text-gray-500">{txt.memoryDesc}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">{txt.skillLabel}</h3>
              <p className="text-sm text-gray-500">{txt.skillDesc}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🎭</div>
              <h3 className="font-semibold mb-1">{txt.profileLabel}</h3>
              <p className="text-sm text-gray-500">{txt.profileDesc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <h2 className="text-xl font-bold mb-6">{txt.selectPlatform}</h2>
      
      <div className="space-y-4">
        {platforms.map((platform) => (
          <Card 
            key={platform.id}
            className={`overflow-hidden transition-all ${expandedPlatform === platform.id ? 'ring-2 ring-purple-500' : ''}`}
          >
            {/* Platform Header */}
            <button
              onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? platform.id : platform.id)}
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
                
                {/* Tips */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {platform.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Link */}
                <a 
                  href={platform.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  {locale === 'zh' ? '打开' : 'Open'} {platform.title.split(' ')[0]}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Next Step */}
      <Card className="mt-12 bg-gradient-to-r from-purple-600 to-pink-500 border-0 text-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">{txt.nextStep}</h3>
            <p className="text-purple-100">{locale === 'zh' ? '把导出的内容导入到 xmemory 管理' : 'Import your exported content to xmemory'}</p>
          </div>
          <Link href="/docs/import">
            <Button className="bg-white text-purple-600 hover:bg-purple-50">
              {txt.importLink}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
