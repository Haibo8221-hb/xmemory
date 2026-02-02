'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES, type Memory } from '@/types/database'
import { ArrowRight, Upload, Download, Zap, Shield, Cloud, Sparkles, FolderOpen, FileOutput, Layers, Lock, RefreshCw } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { MemoryCard } from '@/components/memory/memory-card'

interface Stats {
  memories: number
  downloads: number
  sellers: number
}

export default function HomePage() {
  const { t, locale } = useTranslation()
  const [stats, setStats] = useState<Stats>({ memories: 0, downloads: 0, sellers: 0 })
  const [popularMemories, setPopularMemories] = useState<Memory[]>([])
  const [newestMemories, setNewestMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats)
        setPopularMemories(data.popularMemories)
        setNewestMemories(data.newestMemories)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  
  const texts = {
    en: {
      // New tool-focused messaging
      heroTitle: 'Let Your AI',
      heroTitleHighlight: 'Really Remember You',
      heroSub: 'Import, organize, and sync your ChatGPT Memory.',
      heroSub2: 'Switch between profiles seamlessly, never lose your settings.',
      getStarted: 'Get Started Free',
      watchDemo: 'See How It Works',
      
      // Pain points
      painTitle: 'Sound Familiar?',
      pain1: 'ChatGPT remembers random garbage',
      pain2: 'Memory gone after clearing cache',
      pain3: 'Work and personal contexts mixed up',
      
      // Solutions
      solveTitle: 'xmemory Solves This',
      feature1Title: 'Import',
      feature1Desc: 'Upload JSON or paste text',
      feature2Title: 'Organize',
      feature2Desc: 'Group into Skills',
      feature3Title: 'Export',
      feature3Desc: 'One-click copy, multi-format',
      feature4Title: 'Profiles',
      feature4Desc: 'Switch work/personal modes',
      feature5Title: 'Cloud Sync',
      feature5Desc: 'Never lose your data',
      feature6Title: 'Privacy First',
      feature6Desc: 'Sensitive info detection',
      
      // Solutions section
      solutionsTitle: 'Want More? Try Pro Solutions',
      solutionsDesc: 'Pre-built expert Memory packs for specific use cases',
      
      // Stats
      statsUsers: 'users managing',
      statsMemories: 'memories',
      
      // CTA
      ctaTitle: 'Ready to organize your AI?',
      ctaSub: 'Free to start. Your memories, your control.',
      ctaButton: 'Start Now - Free',
      
      // Categories (secondary)
      exploreTitle: 'Explore Community Skills',
      viewAll: 'View All',
    },
    zh: {
      heroTitle: '让 AI',
      heroTitleHighlight: '真正记住你',
      heroSub: '导入、整理、同步你的 ChatGPT Memory。',
      heroSub2: '跨平台无缝切换，永不丢失。',
      getStarted: '免费开始',
      watchDemo: '了解更多',
      
      painTitle: '这些问题你是否遇到过？',
      pain1: 'ChatGPT 记了一堆乱七八糟的东西',
      pain2: '换设备/清缓存后 Memory 全没了',
      pain3: '工作和生活记忆混在一起',
      
      solveTitle: 'xmemory 帮你解决',
      feature1Title: '导入',
      feature1Desc: '上传 JSON 或粘贴文本',
      feature2Title: '整理',
      feature2Desc: 'Skill 分组管理',
      feature3Title: '导出',
      feature3Desc: '一键复制，多格式支持',
      feature4Title: '场景切换',
      feature4Desc: 'Profile 组合，工作/学习分开',
      feature5Title: '云端同步',
      feature5Desc: '永不丢失，跨设备访问',
      feature6Title: '隐私安全',
      feature6Desc: '敏感信息自动检测',
      
      solutionsTitle: '还想更进一步？试试专业方案',
      solutionsDesc: '针对特定场景的专家 Memory 套装',
      
      statsUsers: '位用户管理了',
      statsMemories: '条 AI 记忆',
      
      ctaTitle: '准备好整理你的 AI 了吗？',
      ctaSub: '免费开始，你的记忆由你掌控。',
      ctaButton: '立即开始 - 免费',
      
      exploreTitle: '探索社区 Skills',
      viewAll: '查看更多',
    }
  }
  
  const txt = texts[locale] || texts.en
  
  // Feature icons
  const features = [
    { icon: Upload, title: txt.feature1Title, desc: txt.feature1Desc, color: 'from-blue-500 to-cyan-500' },
    { icon: FolderOpen, title: txt.feature2Title, desc: txt.feature2Desc, color: 'from-purple-500 to-pink-500' },
    { icon: FileOutput, title: txt.feature3Title, desc: txt.feature3Desc, color: 'from-green-500 to-emerald-500' },
    { icon: Layers, title: txt.feature4Title, desc: txt.feature4Desc, color: 'from-orange-500 to-amber-500' },
    { icon: Cloud, title: txt.feature5Title, desc: txt.feature5Desc, color: 'from-indigo-500 to-violet-500' },
    { icon: Lock, title: txt.feature6Title, desc: txt.feature6Desc, color: 'from-red-500 to-rose-500' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Tool focused */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>AI Memory 管理工具</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              {txt.heroTitle}
              <span className="text-gradient block md:inline"> {txt.heroTitleHighlight}</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-2 animate-fade-in">
              {txt.heroSub}
            </p>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in">
              {txt.heroSub2}
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
              <Link href="/dashboard/memory-bank">
                <Button size="lg" className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-lg px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25">
                  {txt.getStarted}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/docs/import">
                <Button size="lg" variant="outline" className="btn-hover text-lg px-8 py-6 rounded-xl border-2">
                  {txt.watchDemo}
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 text-sm text-gray-500 animate-fade-in">
              <span>✓ {stats.sellers}+ {txt.statsUsers} {stats.memories}+ {txt.statsMemories}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            😫 {txt.painTitle}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[txt.pain1, txt.pain2, txt.pain3].map((pain, i) => (
              <Card key={i} className="bg-white border-red-100 hover:border-red-200 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{['🤯', '😱', '😵'][i]}</div>
                  <p className="text-gray-700">{pain}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Solutions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            ✅ {txt.solveTitle}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            {locale === 'zh' ? '六大核心功能，让你的 AI 记忆井井有条' : 'Six core features to keep your AI memory organized'}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Solutions (secondary) */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              🚀 {txt.solutionsTitle}
            </h2>
            <p className="text-gray-600">{txt.solutionsDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { emoji: '💼', name: locale === 'zh' ? '面试助手' : 'Interview Coach', price: '$9.99' },
              { emoji: '✍️', name: locale === 'zh' ? '写作教练' : 'Writing Coach', price: '$19.99' },
              { emoji: '💻', name: locale === 'zh' ? '编程专家' : 'Coding Expert', price: '$14.99' },
            ].map((solution, i) => (
              <Link key={i} href="/pricing">
                <Card className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{solution.emoji}</div>
                    <h3 className="font-semibold mb-2">{solution.name}</h3>
                    <p className="text-purple-600 font-bold">{solution.price}</p>
                    <p className="text-sm text-gray-400 mt-2 group-hover:text-purple-500 transition-colors">
                      {locale === 'zh' ? '了解更多 →' : 'Learn more →'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community Skills (tertiary) */}
      {popularMemories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{txt.exploreTitle}</h2>
              <Link href="/explore">
                <Button variant="outline" className="btn-hover">
                  {txt.viewAll}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularMemories.slice(0, 4).map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {txt.ctaTitle}
          </h2>
          <p className="text-purple-100 text-lg mb-8">
            {txt.ctaSub}
          </p>
          <Link href="/dashboard/memory-bank">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg">
              {txt.ctaButton}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
