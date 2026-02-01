'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CATEGORIES, SUBCATEGORIES, type Platform } from '@/types/database'
import { MIN_PRICE_USD } from '@/lib/stripe'
import { Upload, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: '',
    price: '',
    platform: 'chatgpt' as Platform,
    previewContent: '',
    agreeToTerms: false,
    confirmPrivacy: false,
  })
  
  // 当分类变化时，重置二级分类
  const handleCategoryChange = (newCategory: string) => {
    setFormData(prev => ({ ...prev, category: newCategory, subcategory: '' }))
  }
  
  // 获取当前分类的二级分类列表
  const availableSubcategories = formData.category ? SUBCATEGORIES[formData.category] || [] : []
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Try to read preview content - extract first 20%
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        // Calculate 20% of content, min 200 chars, max 2000 chars
        const previewLength = Math.min(2000, Math.max(200, Math.floor(content.length * 0.2)))
        const preview = content.slice(0, previewLength)
        setFormData(prev => ({
          ...prev,
          previewContent: preview + (content.length > previewLength ? '\n\n[... 更多内容购买后可见 ...]' : '')
        }))
      }
      reader.readAsText(selectedFile)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/upload')
        return
      }
      
      if (!file) {
        setError('请上传Memory文件')
        return
      }
      
      if (!formData.agreeToTerms || !formData.confirmPrivacy) {
        setError('请阅读并同意相关协议')
        return
      }
      
      // Validate price (must be 0 or >= MIN_PRICE_USD)
      const price = parseFloat(formData.price) || 0
      if (price > 0 && price < MIN_PRICE_USD) {
        setError(`价格必须至少 $${MIN_PRICE_USD.toFixed(2)} 或设为免费（$0）`)
        return
      }
      
      // Upload file
      const fileName = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      // Create memory record
      const { error: insertError } = await supabase
        .from('memories')
        .insert({
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category || null,
          subcategory: formData.subcategory || null,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          price: parseFloat(formData.price) || 0,
          file_path: fileName,
          preview_content: formData.previewContent,
          platform: formData.platform,
          status: 'active',
        })
      
      if (insertError) throw insertError
      
      router.push('/dashboard/sales')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '上传失败，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">上传Memory</h1>
      <p className="text-gray-500 mb-8">分享你调教好的AI记忆，让它帮助更多人</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        
        {/* File upload */}
        <Card>
          <CardHeader>
            <CardTitle>Memory文件</CardTitle>
            <CardDescription>
              从ChatGPT设置中导出的Memory文件（JSON格式）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                {file ? (
                  <p className="text-sm text-gray-600">{file.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">点击上传或拖拽文件</p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".json,.txt"
                onChange={handleFileChange}
              />
            </label>
          </CardContent>
        </Card>
        
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">标题 *</label>
              <Input
                required
                placeholder="例如：资深前端开发助手"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="描述这个Memory的特点、适用场景..."
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={e => handleCategoryChange(e.target.value)}
                >
                  <option value="">选择分类</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">二级分类</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.subcategory}
                  onChange={e => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  disabled={!formData.category || availableSubcategories.length === 0}
                >
                  <option value="">选择二级分类</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">平台</label>
              <select
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.platform}
                onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value as Platform }))}
              >
                <option value="chatgpt">ChatGPT</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">标签</label>
              <Input
                placeholder="用逗号分隔，例如：React, TypeScript, 前端"
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>定价</CardTitle>
            <CardDescription>设置为0表示免费，收费最低$0.50起，平台抽取20%服务费</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-32"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
              <span className="text-sm text-gray-500">USD</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">提示：定价$0为免费，收费至少$0.50（Stripe限制）</p>
          </CardContent>
        </Card>
        
        {/* Agreements */}
        <Card>
          <CardHeader>
            <CardTitle>确认事项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={formData.confirmPrivacy}
                onChange={e => setFormData(prev => ({ ...prev, confirmPrivacy: e.target.checked }))}
              />
              <span className="text-sm">
                我确认已检查并清除Memory文件中的个人敏感信息（如姓名、地址、联系方式等），并对上传内容负全部责任
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={formData.agreeToTerms}
                onChange={e => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
              />
              <span className="text-sm">
                我已阅读并同意<a href="/terms" className="text-blue-600 hover:underline">用户协议</a>和<a href="/privacy" className="text-blue-600 hover:underline">隐私政策</a>
              </span>
            </label>
          </CardContent>
        </Card>
        
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? '上传中...' : '发布Memory'}
        </Button>
      </form>
    </div>
  )
}
