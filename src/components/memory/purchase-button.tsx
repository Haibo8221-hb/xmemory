'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PurchaseButtonProps {
  memoryId: string
  price: number
  isFree: boolean
}

export function PurchaseButton({ memoryId, price, isFree }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  async function handlePurchase() {
    setLoading(true)
    setError(null)
    
    try {
      // Check if logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push(`/auth/login?redirect=/memory/${memoryId}`)
        return
      }
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || '购买失败')
        return
      }
      
      // Free memory - redirect to purchases
      if (data.free) {
        router.push('/dashboard/purchases')
        return
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
      
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <Button 
        className="w-full" 
        size="lg" 
        onClick={handlePurchase}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            处理中...
          </>
        ) : (
          isFree ? '免费获取' : '立即购买'
        )}
      </Button>
      
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </div>
  )
}
