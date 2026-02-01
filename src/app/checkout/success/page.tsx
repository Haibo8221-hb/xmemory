'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchOrder() {
      if (!sessionId) {
        setLoading(false)
        return
      }
      
      const supabase = createClient()
      
      // Get order by stripe session id
      const { data } = await supabase
        .from('orders')
        .select('*, memory:memories(*)')
        .eq('stripe_payment_id', sessionId)
        .single()
      
      // If not found by session_id, try finding by payment_intent
      if (!data) {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: retryData } = await supabase
          .from('orders')
          .select('*, memory:memories(*)')
          .eq('stripe_payment_id', sessionId)
          .single()
        
        setOrder(retryData)
      } else {
        setOrder(data)
      }
      
      setLoading(false)
    }
    
    fetchOrder()
  }, [sessionId])
  
  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">支付成功！</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {order?.memory && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.memory.title}</p>
              <p className="text-sm text-gray-500">{order.memory.platform}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Link href="/dashboard/purchases">
              <Button className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                前往下载
              </Button>
            </Link>
            
            <Link href="/explore">
              <Button variant="outline" className="w-full">
                继续浏览
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>Memory已添加到您的购买列表</p>
            <p>您可以随时在「我的购买」中下载</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
