'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react'

export default function PricingPage() {
  const { locale } = useTranslation()
  const [annual, setAnnual] = useState(false)
  
  const texts = {
    en: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Start free, upgrade when you need more',
      monthly: 'Monthly',
      annually: 'Annually',
      savePercent: 'Save 20%',
      
      // Free Plan
      freeTitle: 'Free',
      freePrice: '$0',
      freeDesc: 'Perfect for getting started',
      freeFeatures: [
        'Up to 5 Memory slots',
        '3 Skills',
        '1 Profile',
        'Basic export (text)',
        'Community support',
      ],
      freeCta: 'Get Started Free',
      
      // Pro Plan
      proTitle: 'Pro',
      proPrice: '$5',
      proPriceAnnual: '$4',
      proDesc: 'For power users who need more',
      proFeatures: [
        'Unlimited Memory slots',
        'Unlimited Skills',
        'Unlimited Profiles',
        'All export formats (JSON, MD)',
        'AI-powered auto-categorization',
        'Privacy scanner',
        'Cloud sync across devices',
        'Priority support',
      ],
      proCta: 'Upgrade to Pro',
      proPopular: 'Most Popular',
      
      // Solutions
      solutionsTitle: 'Pro Solutions',
      solutionsDesc: 'Pre-built expert Memory packs',
      solutionsList: [
        { name: 'Interview Coach', price: '$9.99', desc: 'Ace your job interviews with AI preparation' },
        { name: 'Writing Coach', price: '$19.99', desc: 'Improve your writing with personalized feedback' },
        { name: 'Coding Expert', price: '$14.99', desc: 'Level up your programming skills' },
      ],
      solutionsCta: 'Browse All Solutions',
      
      // FAQ
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your data remains accessible.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards via Stripe.' },
        { q: 'Is my data secure?', a: 'Yes, all data is encrypted and stored securely. We never share your memories.' },
      ],
    },
    zh: {
      title: '简单透明的定价',
      subtitle: '免费开始，按需升级',
      monthly: '月付',
      annually: '年付',
      savePercent: '省 20%',
      
      freeTitle: '免费版',
      freePrice: '¥0',
      freeDesc: '适合入门用户',
      freeFeatures: [
        '最多 5 个 Memory 槽位',
        '3 个 Skills',
        '1 个 Profile',
        '基础导出（文本）',
        '社区支持',
      ],
      freeCta: '免费开始',
      
      proTitle: 'Pro 专业版',
      proPrice: '¥35',
      proPriceAnnual: '¥28',
      proDesc: '为需要更多功能的用户',
      proFeatures: [
        '无限 Memory 槽位',
        '无限 Skills',
        '无限 Profiles',
        '所有导出格式（JSON, MD）',
        'AI 智能分类',
        '隐私扫描器',
        '跨设备云同步',
        '优先支持',
      ],
      proCta: '升级到 Pro',
      proPopular: '最受欢迎',
      
      solutionsTitle: 'Pro 专业方案',
      solutionsDesc: '预制的专家 Memory 套装',
      solutionsList: [
        { name: '面试助手', price: '¥69', desc: 'AI 帮你准备面试，提升成功率' },
        { name: '写作教练', price: '¥139', desc: '个性化写作反馈，提升文笔' },
        { name: '编程专家', price: '¥99', desc: '提升编程技能，写出更好的代码' },
      ],
      solutionsCta: '浏览全部方案',
      
      faqTitle: '常见问题',
      faqs: [
        { q: '可以随时取消吗？', a: '可以，您可以随时取消订阅。您的数据仍可访问。' },
        { q: '支持哪些支付方式？', a: '我们通过 Stripe 支持所有主流信用卡。' },
        { q: '我的数据安全吗？', a: '是的，所有数据都经过加密并安全存储。我们绝不分享您的记忆。' },
      ],
    }
  }
  
  const txt = texts[locale] || texts.zh

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-center py-16 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{txt.title}</h1>
        <p className="text-xl text-gray-600 mb-8">{txt.subtitle}</p>
        
        {/* Toggle */}
        <div className="inline-flex items-center gap-3 p-1 bg-gray-100 rounded-full">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !annual ? 'bg-white shadow text-purple-600' : 'text-gray-600'
            }`}
          >
            {txt.monthly}
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              annual ? 'bg-white shadow text-purple-600' : 'text-gray-600'
            }`}
          >
            {txt.annually}
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {txt.savePercent}
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-gray-600" />
              </div>
              <CardTitle className="text-2xl">{txt.freeTitle}</CardTitle>
              <p className="text-gray-500">{txt.freeDesc}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">{txt.freePrice}</span>
                <span className="text-gray-500">/{locale === 'zh' ? '月' : 'mo'}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {txt.freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/memory-bank">
                <Button variant="outline" className="w-full">{txt.freeCta}</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-purple-500 shadow-lg shadow-purple-100">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                {txt.proPopular}
              </span>
            </div>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">{txt.proTitle}</CardTitle>
              <p className="text-gray-500">{txt.proDesc}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">{annual ? txt.proPriceAnnual : txt.proPrice}</span>
                <span className="text-gray-500">/{locale === 'zh' ? '月' : 'mo'}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {txt.proFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 border-0">
                {txt.proCta}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Solutions */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{txt.solutionsTitle}</h2>
          <p className="text-gray-600">{txt.solutionsDesc}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {txt.solutionsList.map((solution, i) => (
            <Link key={i} href="/explore">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{['💼', '✍️', '💻'][i]}</div>
                  <h3 className="font-semibold mb-1">{solution.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{solution.desc}</p>
                  <p className="text-purple-600 font-bold">{solution.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/explore">
            <Button variant="outline">
              {txt.solutionsCta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">{txt.faqTitle}</h2>
          <div className="space-y-4">
            {txt.faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
