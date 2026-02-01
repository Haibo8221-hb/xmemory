'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, DollarSign, Star, Brain, Shield, ArrowRight, Cloud, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useTranslation()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMemories: 0,
    totalEarnings: 0,
    totalSales: 0,
    totalPurchases: 0,
    bankCount: 0,
    cloudCount: 0,
  })
  
  const texts = {
    en: {
      title: 'My Account',
      myMemories: 'My Memories',
      totalEarnings: 'Total Earnings',
      salesCount: 'Sales',
      myPurchases: 'My Purchases',
      memoryBank: 'Memory Bank',
      memoryBankDesc: 'Your private AI memory storage across all platforms',
      mySales: 'My Sales',
      mySalesDesc: 'Manage your uploaded Memories and view sales data',
      myOrders: 'My Purchases',
      myOrdersDesc: 'View purchased Memories and download files',
      private: 'Private',
      new: 'New',
      cloudMemory: 'Cloud Memory',
      cloudMemoryDesc: 'Backup & sync your AI Memory across devices',
      cloudCount: 'Cloud Backups',
    },
    zh: {
      title: '我的账户',
      myMemories: '我的Memory',
      totalEarnings: '总收入',
      salesCount: '销售次数',
      myPurchases: '我的购买',
      memoryBank: 'Memory银行',
      memoryBankDesc: '你的私人AI记忆存储库，支持多平台管理',
      mySales: '我卖的',
      mySalesDesc: '管理你上传的Memory，查看销售数据',
      myOrders: '我买的',
      myOrdersDesc: '查看已购买的Memory，下载文件',
      private: '私密',
      new: '新',
      cloudMemory: '云端Memory',
      cloudMemoryDesc: '备份和同步你的AI记忆，支持版本历史',
      cloudCount: '云端备份',
    }
  }
  
  const txt = texts[locale]
  
  useEffect(() => {
    checkAuthAndFetch()
  }, [])
  
  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/dashboard')
      return
    }
    
    // Fetch stats
    const [memoriesRes, purchasesRes, bankRes, cloudRes] = await Promise.all([
      supabase.from('memories').select('id').eq('seller_id', user.id),
      supabase.from('orders').select('id').eq('buyer_id', user.id).eq('status', 'completed'),
      supabase.from('user_memories').select('id').eq('user_id', user.id),
      supabase.from('cloud_memories').select('id').eq('user_id', user.id),
    ])
    
    setStats({
      totalMemories: memoriesRes.data?.length || 0,
      totalEarnings: 0, // TODO: Calculate from sales
      totalSales: 0,
      totalPurchases: purchasesRes.data?.length || 0,
      bankCount: bankRes.data?.length || 0,
      cloudCount: cloudRes.data?.length || 0,
    })
    
    setLoading(false)
  }
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gradient">{txt.title}</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="card-hover border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMemories}</p>
                <p className="text-sm text-gray-500">{txt.myMemories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-200">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</p>
                <p className="text-sm text-gray-500">{txt.totalEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-200">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSales}</p>
                <p className="text-sm text-gray-500">{txt.salesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-200">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                <p className="text-sm text-gray-500">{txt.myPurchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Cloud Memory - Featured */}
        <Link href="/dashboard/cloud" className="md:col-span-2">
          <Card className="card-hover border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white overflow-hidden relative h-full">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                <History className="w-3 h-3" />
                Version History
              </span>
              <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                {txt.new}
              </span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Cloud className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-2xl">{txt.cloudMemory}</span>
                  <p className="text-blue-100 font-normal text-sm mt-1">{txt.cloudMemoryDesc}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-4xl font-bold">{stats.cloudCount}</div>
              <ArrowRight className="w-6 h-6" />
            </CardContent>
          </Card>
        </Link>

        {/* Memory Bank */}
        <Link href="/dashboard/memory-bank">
          <Card className="card-hover border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white overflow-hidden relative h-full">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {txt.private}
              </span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xl">{txt.memoryBank}</span>
                  <p className="text-purple-100 font-normal text-sm mt-1">{txt.memoryBankDesc}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.bankCount}</div>
              <ArrowRight className="w-6 h-6" />
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/sales">
          <Card className="card-hover border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                {txt.mySales}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">{txt.mySalesDesc}</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/purchases">
          <Card className="card-hover border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                </div>
                {txt.myOrders}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">{txt.myOrdersDesc}</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/upload">
          <Card className="card-hover border-0 shadow-md h-full border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Package className="w-5 h-5 text-gray-500" />
                </div>
                {locale === 'en' ? 'Sell Memory' : '出售Memory'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                {locale === 'en' 
                  ? 'Upload and sell your trained AI memories'
                  : '上传并出售你调教好的AI记忆'}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
