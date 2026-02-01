'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES } from '@/types/database'
import { ArrowRight, Upload, ShoppingCart, Zap } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

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

export default function HomePage() {
  const { t, locale } = useTranslation()
  
  const texts = {
    en: {
      hero: 'AI Memory Marketplace',
      heroSub: 'Turn your AI training into profit. Share your ChatGPT Memory,',
      heroSub2: 'let others skip the cold start and get a specialized AI assistant.',
      howItWorks: 'How It Works',
      step1Title: '1. Export & Upload',
      step1Desc: 'Export your Memory file from ChatGPT, upload to platform and set price',
      step2Title: '2. Browse & Buy',
      step2Desc: 'Find what you need, buy carefully trained Memory from others',
      step3Title: '3. Import & Use',
      step3Desc: 'Import Memory to your AI, instantly get a specialized assistant',
      categories: 'Popular Categories',
      viewAll: 'View All Categories',
      ctaTitle: 'Ready to share your AI?',
      ctaSub: 'Turn the time you spent training AI into income',
      getStarted: 'Get Started',
    },
    zh: {
      hero: 'AI记忆交易市场',
      heroSub: '把你调教AI的心血变现。分享你的ChatGPT Memory，',
      heroSub2: '让别人跳过冷启动，直接获得专业化的AI助手。',
      howItWorks: '如何运作',
      step1Title: '1. 导出 & 上传',
      step1Desc: '从ChatGPT导出你的Memory文件，上传到平台并设置价格',
      step2Title: '2. 浏览 & 购买',
      step2Desc: '找到你需要的领域，购买别人精心调教的Memory',
      step3Title: '3. 导入 & 使用',
      step3Desc: '将Memory导入到你的AI，立即获得专业化的助手体验',
      categories: '热门分类',
      viewAll: '查看全部分类',
      ctaTitle: '准备好分享你的AI了吗？',
      ctaSub: '把你花在调教AI上的时间变成收入',
      getStarted: '立即开始',
    }
  }
  
  const txt = texts[locale]
  
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-blue-600">{locale === 'en' ? 'AI Memory' : 'AI记忆'}</span>
            {locale === 'en' ? ' Marketplace' : '交易市场'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {txt.heroSub}<br />
            {txt.heroSub2}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg">
                {t('home.cta')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline">
                {t('home.upload')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{txt.howItWorks}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{txt.step1Title}</h3>
                <p className="text-gray-500">{txt.step1Desc}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{txt.step2Title}</h3>
                <p className="text-gray-500">{txt.step2Desc}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{txt.step3Title}</h3>
                <p className="text-gray-500">{txt.step3Desc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{txt.categories}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 5).map(category => (
              <Link
                key={category.value}
                href={`/explore?category=${category.value}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <span className="text-4xl mb-3 block">{category.emoji}</span>
                    <span className="font-medium">
                      {categoryLabels[category.value]?.[locale] || category.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/explore">
              <Button variant="outline">
                {txt.viewAll} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{txt.ctaTitle}</h2>
          <p className="text-gray-600 mb-8">{txt.ctaSub}</p>
          <Link href="/auth/register">
            <Button size="lg">
              {txt.getStarted} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
