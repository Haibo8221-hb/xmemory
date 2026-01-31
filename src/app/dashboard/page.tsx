import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, DollarSign, Star } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/dashboard')
  }
  
  // Get user's memories
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('seller_id', user.id)
  
  // Get user's purchases
  const { data: purchases } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', user.id)
    .eq('status', 'completed')
  
  // Get user's sales
  const { data: sales } = await supabase
    .from('orders')
    .select('*, memory:memories(*)')
    .eq('status', 'completed')
    .in('memory_id', memories?.map(m => m.id) || [])
  
  const totalEarnings = sales?.reduce((sum, order) => sum + order.seller_amount, 0) || 0
  const totalSales = sales?.length || 0
  const totalMemories = memories?.length || 0
  const totalPurchases = purchases?.length || 0
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">我的账户</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMemories}</p>
                <p className="text-sm text-gray-500">我的Memory</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(totalEarnings)}</p>
                <p className="text-sm text-gray-500">总收入</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSales}</p>
                <p className="text-sm text-gray-500">销售次数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPurchases}</p>
                <p className="text-sm text-gray-500">我的购买</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/sales">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                我卖的
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">管理你上传的Memory，查看销售数据</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/purchases">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                我买的
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">查看已购买的Memory，下载文件</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
