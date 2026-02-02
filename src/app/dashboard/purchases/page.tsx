import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { CATEGORIES } from '@/types/database'
import { ExternalLink } from 'lucide-react'
import { DownloadButton } from '@/components/memory/download-button'

export default async function PurchasesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/dashboard/purchases')
  }
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*, memory:memories(*, seller:profiles(*))')
    .eq('buyer_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">我买的</h1>
        <p className="text-gray-500">你购买的Memory列表</p>
      </div>
      
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => {
            const memory = order.memory
            const category = CATEGORIES.find(c => c.value === memory?.category)
            return (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <span className="text-3xl">{category?.emoji || '📦'}</span>
                      <div>
                        <Link 
                          href={`/memory/${memory?.id}`}
                          className="text-lg font-semibold hover:text-blue-600 flex items-center gap-1"
                        >
                          {memory?.title}
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                            {memory?.platform}
                          </span>
                          <span>卖家: {memory?.seller?.display_name || '匿名'}</span>
                          <span>购买于 {formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold mb-2">
                        {formatPrice(order.amount)}
                      </p>
                      <DownloadButton 
                        filePath={memory?.file_path || ''} 
                        filename={`${memory?.title || 'memory'}.json`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500 mb-4">你还没有购买任何Memory</p>
            <Link href="/explore">
              <Button>浏览市场</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
