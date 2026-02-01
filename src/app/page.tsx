'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES, type Memory } from '@/types/database'
import { ArrowRight, Upload, ShoppingCart, Zap, Shield, Download, Sparkles, TrendingUp, Users, Package } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { MemoryCard } from '@/components/memory/memory-card'

// Category gradients
const categoryGradients: Record<string, string> = {
  development: 'category-development',
  writing: 'category-writing',
  business: 'category-business',
  education: 'category-education',
  lifestyle: 'category-lifestyle',
  creative: 'category-creative',
  other: 'bg-gray-50',
}

// Category labels for i18n
const categoryLabels: Record<string, { en: string; zh: string }> = {
  development: { en: 'Development', zh: '编程开发' },
  writing: { en: 'Writing', zh: '写作创作' },
  business: { en: 'Business', zh: '商业办公' },
  education: { en: 'Education', zh: '教育学习' },
  lifestyle: { en: 'Lifestyle', zh: '生活方式' },
  creative: { en: 'Creative', zh: '创意设计' },
  other: { en: 'Other', zh: '其他' },
}

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
      heroSub: 'Turn your AI training into profit. Share your ChatGPT Memory,',
      heroSub2: 'let others skip the cold start and get a specialized AI assistant instantly.',
      howItWorks: 'How It Works',
      step1Title: 'Export & Upload',
      step1Desc: 'Export your Memory file from ChatGPT, upload and set your price',
      step2Title: 'Browse & Buy',
      step2Desc: 'Find what you need, purchase carefully trained Memory from experts',
      step3Title: 'Import & Use',
      step3Desc: 'Import Memory to your AI, instantly unlock specialized capabilities',
      categories: 'Popular Categories',
      viewAll: 'View All Categories',
      ctaTitle: 'Ready to share your AI?',
      ctaSub: 'Transform your AI training time into income',
      getStarted: 'Get Started',
      trustSecure: 'Secure Payment',
      trustInstant: 'Instant Download',
      trustQuality: 'Quality Verified',
      statsMemories: 'Memories',
      statsDownloads: 'Downloads',
      statsSellers: 'Sellers',
      popularTitle: 'Popular Memories',
      newestTitle: 'Just Added',
      viewMore: 'View More',
    },
    zh: {
      heroSub: '把你调教AI的心血变现。分享你的ChatGPT Memory，',
      heroSub2: '让别人跳过冷启动，直接获得专业化的AI助手。',
      howItWorks: '如何运作',
      step1Title: '导出 & 上传',
      step1Desc: '从ChatGPT导出Memory文件，上传到平台并设置价格',
      step2Title: '浏览 & 购买',
      step2Desc: '找到你需要的领域，购买专家精心调教的Memory',
      step3Title: '导入 & 使用',
      step3Desc: '将Memory导入到你的AI，立即解锁专业化能力',
      categories: '热门分类',
      viewAll: '查看全部分类',
      ctaTitle: '准备好分享你的AI了吗？',
      ctaSub: '把你花在调教AI上的时间变成收入',
      getStarted: '立即开始',
      trustSecure: '安全交易',
      trustInstant: '即时下载',
      trustQuality: '品质保证',
      statsMemories: '个Memory',
      statsDownloads: '次下载',
      statsSellers: '位卖家',
      popularTitle: '热门Memory',
      newestTitle: '最新上架',
      viewMore: '查看更多',
    }
  }
  
  const txt = texts[locale]
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 float-animation" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 float-animation" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 float-animation" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {locale === 'en' ? 'AI Memory Marketplace' : 'AI记忆交易市场'}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">
              {locale === 'en' ? 'AI Memory' : 'AI记忆'}
            </span>
            <br />
            <span className="text-gray-900">
              {locale === 'en' ? 'Marketplace' : '交易市场'}
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {txt.heroSub}<br />
            {txt.heroSub2}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-purple-600">
                <Package className="w-6 h-6" />
                <span>{loading ? '...' : stats.memories}+</span>
              </div>
              <div className="text-sm text-gray-500">{txt.statsMemories}</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-pink-600">
                <Download className="w-6 h-6" />
                <span>{loading ? '...' : stats.downloads}+</span>
              </div>
              <div className="text-sm text-gray-500">{txt.statsDownloads}</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-cyan-600">
                <Users className="w-6 h-6" />
                <span>{loading ? '...' : stats.sellers}+</span>
              </div>
              <div className="text-sm text-gray-500">{txt.statsSellers}</div>
            </div>
          </div>
          
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mb-10 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>{txt.trustSecure}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span>{txt.trustInstant}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>{txt.trustQuality}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0 px-8 py-6 text-lg rounded-full">
                {t('home.cta')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="btn-hover px-8 py-6 text-lg rounded-full border-2 hover:border-purple-300 hover:bg-purple-50">
                {t('home.upload')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Memories */}
      {popularMemories.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">{txt.popularTitle}</h2>
              </div>
              <Link href="/explore">
                <Button variant="ghost" className="text-purple-600">
                  {txt.viewMore} <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularMemories.map(memory => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newest Memories */}
      {newestMemories.length > 0 && (
        <section className="py-16 px-4 bg-gray-50/50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-pink-600" />
                <h2 className="text-2xl font-bold">{txt.newestTitle}</h2>
              </div>
              <Link href="/explore">
                <Button variant="ghost" className="text-pink-600">
                  {txt.viewMore} <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newestMemories.map(memory => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{txt.howItWorks}</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            {locale === 'en' 
              ? 'Three simple steps to start trading AI memories'
              : '三个简单步骤，开始交易AI记忆'}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-lg shadow-purple-100/50">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium text-purple-600 mb-2">Step 1</div>
                <h3 className="text-xl font-semibold mb-3">{txt.step1Title}</h3>
                <p className="text-gray-500">{txt.step1Desc}</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-0 shadow-lg shadow-pink-100/50">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-200">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium text-pink-600 mb-2">Step 2</div>
                <h3 className="text-xl font-semibold mb-3">{txt.step2Title}</h3>
                <p className="text-gray-500">{txt.step2Desc}</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-0 shadow-lg shadow-cyan-100/50">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-200">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium text-cyan-600 mb-2">Step 3</div>
                <h3 className="text-xl font-semibold mb-3">{txt.step3Title}</h3>
                <p className="text-gray-500">{txt.step3Desc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-gray-50/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{txt.categories}</h2>
          <p className="text-gray-500 text-center mb-12">
            {locale === 'en' 
              ? 'Find the perfect AI memory for your needs'
              : '找到适合你需求的AI记忆'}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 5).map(category => (
              <Link
                key={category.value}
                href={`/explore?category=${category.value}`}
              >
                <Card className={`card-hover border-0 cursor-pointer ${categoryGradients[category.value] || 'bg-gray-50'}`}>
                  <CardContent className="pt-8 pb-6 text-center">
                    <span className="text-5xl mb-4 block float-animation" style={{ animationDuration: '4s' }}>
                      {category.emoji}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {categoryLabels[category.value]?.[locale] || category.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/explore">
              <Button variant="outline" className="btn-hover rounded-full px-6">
                {txt.viewAll} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAyczItNCA0LTRjMiAwIDQgMiA0IDJzMi0yIDItNGMwLTItMi00LTItNHMtMiAyLTQgMmMtMiAwLTQtMi00LTJzMiA0IDIgNGMwIDItMiA0LTIgNHMyIDIgNCAyYzIgMCA0LTIgNC0ycy0yIDQtMiA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-white">{txt.ctaTitle}</h2>
          <p className="text-purple-100 mb-10 text-lg">{txt.ctaSub}</p>
          <Link href="/explore">
            <Button size="lg" className="btn-hover bg-white text-purple-600 hover:bg-gray-100 px-10 py-6 text-lg rounded-full font-semibold">
              {txt.getStarted} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
