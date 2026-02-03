'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CATEGORIES, SUBCATEGORIES, CONTENT_TYPES, type Platform, type ContentType } from '@/types/database'
import { MIN_PRICE_USD } from '@/lib/constants'
import { 
  Upload, AlertCircle, Brain, Zap, User, ArrowLeft, Check, 
  Sparkles, Loader2, FileText, Wand2
} from 'lucide-react'

interface AIAnalysis {
  contentType: string
  platform: string
  category: string
  title: string
  description: string
  tags: string[]
}

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<'upload' | 'review'>('upload')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState('')
  
  const [formData, setFormData] = useState({
    contentType: 'memory' as ContentType,
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
  
  const selectedContentType = CONTENT_TYPES.find(ct => ct.value === formData.contentType)!
  const availableSubcategories = formData.category ? SUBCATEGORIES[formData.category] || [] : []
  
  // Handle file upload and AI analysis
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    setAnalyzing(true)
    setError('')
    
    try {
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = reject
        reader.readAsText(selectedFile)
      })
      
      setFileContent(content)
      
      // Generate preview (first 20%)
      const previewLength = Math.min(2000, Math.max(200, Math.floor(content.length * 0.2)))
      const preview = content.slice(0, previewLength)
      
      // Call AI analysis API
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, filename: selectedFile.name }),
      })
      
      if (res.ok) {
        const { analysis } = await res.json() as { analysis: AIAnalysis }
        
        // Pre-fill form with AI suggestions
        setFormData(prev => ({
          ...prev,
          contentType: (analysis.contentType as ContentType) || prev.contentType,
          platform: (analysis.platform as Platform) || prev.platform,
          category: analysis.category || prev.category,
          title: analysis.title || prev.title,
          description: analysis.description || prev.description,
          tags: analysis.tags?.join(', ') || prev.tags,
          previewContent: preview + (content.length > previewLength ? '\n\n[... 更多内容购买后可见 ...]' : ''),
        }))
      }
      
      // Move to review step
      setStep('review')
    } catch (err) {
      console.error('File analysis error:', err)
      setError('文件读取失败，请重试')
    } finally {
      setAnalyzing(false)
    }
  }
  
  const handleCategoryChange = (newCategory: string) => {
    setFormData(prev => ({ ...prev, category: newCategory, subcategory: '' }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/upload')
        return
      }
      
      if (!file) {
        setError(`请上传${selectedContentType.labelZh}文件`)
        return
      }
      
      if (!formData.agreeToTerms || !formData.confirmPrivacy) {
        setError('请阅读并同意相关协议')
        return
      }
      
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
      
      // Create record
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
          content_type: formData.contentType,
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
  
  // Step 1: Upload file
  if (step === 'upload') {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI 智能识别</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">上传内容</h1>
          <p className="text-gray-500">上传文件，AI 自动识别标题、描述、分类</p>
        </div>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        
        <Card className="border-2 border-dashed hover:border-purple-400 transition-colors">
          <CardContent className="p-12">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              {analyzing ? (
                <>
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-1">AI 正在分析...</p>
                  <p className="text-sm text-gray-500">识别内容类型、生成标题和描述</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-1">点击或拖拽上传文件</p>
                  <p className="text-sm text-gray-500 mb-4">支持 JSON, TXT, MD, YAML 等格式</p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {CONTENT_TYPES.map(ct => (
                      <span key={ct.value} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {ct.emoji} {ct.labelZh}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept=".json,.txt,.md,.yaml,.yml,.skill,.zip"
                onChange={handleFileChange}
                disabled={analyzing}
              />
            </label>
          </CardContent>
        </Card>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            AI 自动填充
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ 自动识别内容类型（Memory/Skill/Profile）</li>
            <li>✓ 自动生成标题和描述</li>
            <li>✓ 智能推荐分类和标签</li>
            <li>✓ 检测来源平台（ChatGPT/Claude）</li>
          </ul>
        </div>
      </div>
    )
  }
  
  // Step 2: Review and edit AI suggestions
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <button 
        onClick={() => {
          setStep('upload')
          setFile(null)
          setFileContent('')
        }}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        重新上传
      </button>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">检查并发布</h1>
          <p className="text-gray-500 text-sm">AI 已自动填充，请检查并修改</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        
        {/* File info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file?.name}</p>
              <p className="text-sm text-gray-500">{(file?.size || 0 / 1024).toFixed(1)} KB</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              formData.contentType === 'memory' ? 'bg-purple-100 text-purple-700' :
              formData.contentType === 'skill' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {selectedContentType.emoji} {selectedContentType.labelZh}
            </span>
          </CardContent>
        </Card>
        
        {/* Content type selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">内容类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contentType: ct.value }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.contentType === ct.value 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{ct.emoji}</span>
                  <p className="text-sm font-medium mt-1">{ct.labelZh}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Basic info with AI badge */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              基本信息
              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI 生成
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">标题 *</label>
              <Input
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="block text-sm font-medium mb-1">平台</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.platform}
                  onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value as Platform }))}
                >
                  <option value="chatgpt">ChatGPT</option>
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">标签</label>
              <Input
                placeholder="用逗号分隔"
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">定价</CardTitle>
            <CardDescription>$0 = 免费，收费最低 $0.50，平台抽取 20%</CardDescription>
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
          </CardContent>
        </Card>
        
        {/* Agreements */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={formData.confirmPrivacy}
                onChange={e => setFormData(prev => ({ ...prev, confirmPrivacy: e.target.checked }))}
              />
              <span className="text-sm">
                我确认已检查并清除文件中的个人敏感信息
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
        
        <Button 
          type="submit" 
          size="lg" 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 border-0" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              发布中...
            </>
          ) : (
            `发布${selectedContentType.labelZh}`
          )}
        </Button>
      </form>
    </div>
  )
}
