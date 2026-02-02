'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DownloadButtonProps {
  filePath: string
  filename?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showText?: boolean
}

export function DownloadButton({ 
  filePath, 
  filename,
  size = 'sm',
  variant = 'default',
  showText = true 
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  async function handleDownload() {
    if (!filePath) {
      setError('文件路径无效')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data, error: downloadError } = await supabase.storage
        .from('memories')
        .download(filePath)
      
      if (downloadError) {
        throw new Error(downloadError.message)
      }
      
      if (!data) {
        throw new Error('文件不存在')
      }
      
      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || filePath.split('/').pop() || 'memory.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      setError(err instanceof Error ? err.message : '下载失败')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="inline-flex flex-col items-end">
      <Button 
        size={size} 
        variant={variant}
        onClick={handleDownload}
        disabled={loading || !filePath}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            {showText && '下载中...'}
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-1" />
            {showText && '下载'}
          </>
        )}
      </Button>
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  )
}
