'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect old import page to unified upload
export default function ImportPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/upload')
  }, [router])
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-500">正在跳转...</p>
    </div>
  )
}
