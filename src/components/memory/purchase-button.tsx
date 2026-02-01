'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PurchaseButtonProps {
  memoryId: string
  price: number
  isFree: boolean
}

export function PurchaseButton({ memoryId, price, isFree }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadReady, setDownloadReady] = useState(false)
  const [filePath, setFilePath] = useState<string | null>(null)
  const router = useRouter()
  
  async function handlePurchase() {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || '获取失败')
        return
      }
      
      // Free memory - show download button
      if (data.free && data.filePath) {
        setFilePath(data.filePath)
        setDownloadReady(true)
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
  
  async function handleDownload() {
    if (!filePath) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('memories')
        .download(filePath)
      
      if (error) throw error
      
      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = filePath.split('/').pop() || 'memory.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('下载失败，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  // Show download button after free acquisition
  if (downloadReady && filePath) {
    return (
      <div>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700" 
          size="lg" 
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              下载中...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              下载Memory文件
            </>
          )}
        </Button>
        <p className="text-green-600 text-sm text-center mt-2">✓ 获取成功！点击下载</p>
      </div>
    )
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
