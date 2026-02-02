'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Upload, FileJson, ClipboardPaste, ArrowRight, ArrowLeft,
  Check, AlertTriangle, Eye, EyeOff, Brain, Sparkles, Shield
} from 'lucide-react'

type Step = 'choose' | 'upload' | 'paste' | 'preview' | 'save'

interface ParsedMemory {
  content: string
  items: string[]
  warnings: string[]
  platform: string
}

export default function ImportPage() {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useTranslation()
  
  const [step, setStep] = useState<Step>('choose')
  const [file, setFile] = useState<File | null>(null)
  const [pasteContent, setPasteContent] = useState('')
  const [parsed, setParsed] = useState<ParsedMemory | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSensitive, setShowSensitive] = useState(false)
  
  const texts = {
    en: {
      title: 'Import Your AI Memory',
      subtitle: 'Bring your ChatGPT/Claude memory to xmemory',
      chooseMethod: 'Choose import method',
      uploadFile: 'Upload File',
      uploadDesc: 'Upload JSON file exported from ChatGPT',
      pasteText: 'Paste Text',
      pasteDesc: 'Paste memory content directly',
      howToExport: 'How to export from ChatGPT?',
      step1: '1. Open ChatGPT Settings',
      step2: '2. Go to "Personalization" > "Memory"',
      step3: '3. Click "Manage" then "Export"',
      dropHere: 'Drop your file here',
      orClick: 'or click to browse',
      acceptFormats: 'Accepts .json, .txt files',
      pasteHere: 'Paste your memory content here...',
      continue: 'Continue',
      back: 'Back',
      preview: 'Preview Import',
      foundItems: 'Found {count} memory items',
      warnings: 'Potential sensitive info detected',
      warningDesc: 'Review and uncheck items you want to skip',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      showSensitive: 'Show sensitive items',
      hideSensitive: 'Hide sensitive items',
      memoryTitle: 'Memory Title',
      titlePlaceholder: 'My ChatGPT Memory Backup',
      saveToBank: 'Save to Memory Bank',
      saving: 'Saving...',
      success: 'Successfully imported!',
      goToBank: 'Go to Memory Bank',
      importMore: 'Import More',
      noContent: 'No content to import',
      tryAgain: 'Please upload a file or paste content',
    },
    zh: {
      title: '导入你的 AI 记忆',
      subtitle: '把 ChatGPT/Claude 的 Memory 带到 xmemory',
      chooseMethod: '选择导入方式',
      uploadFile: '上传文件',
      uploadDesc: '上传从 ChatGPT 导出的 JSON 文件',
      pasteText: '粘贴文本',
      pasteDesc: '直接粘贴 Memory 内容',
      howToExport: '如何从 ChatGPT 导出？',
      step1: '1. 打开 ChatGPT 设置',
      step2: '2. 进入 "个性化" > "记忆"',
      step3: '3. 点击 "管理" 然后 "导出"',
      dropHere: '拖拽文件到这里',
      orClick: '或点击选择文件',
      acceptFormats: '支持 .json, .txt 格式',
      pasteHere: '在这里粘贴 Memory 内容...',
      continue: '继续',
      back: '返回',
      preview: '预览导入',
      foundItems: '发现 {count} 条记忆',
      warnings: '检测到可能的敏感信息',
      warningDesc: '请检查并取消勾选要跳过的条目',
      selectAll: '全选',
      deselectAll: '取消全选',
      showSensitive: '显示敏感条目',
      hideSensitive: '隐藏敏感条目',
      memoryTitle: 'Memory 标题',
      titlePlaceholder: '我的 ChatGPT Memory 备份',
      saveToBank: '保存到 Memory Bank',
      saving: '保存中...',
      success: '导入成功！',
      goToBank: '前往 Memory Bank',
      importMore: '继续导入',
      noContent: '没有可导入的内容',
      tryAgain: '请上传文件或粘贴内容',
    }
  }
  
  const txt = texts[locale] || texts.en

  // Sensitive keywords to detect
  const sensitivePatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr)\b/i, // Address
    /\b(?:password|密码|pwd)\b/i,
    /\b(?:credit card|银行卡|信用卡)\b/i,
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Card number
  ]

  function detectSensitive(text: string): boolean {
    return sensitivePatterns.some(pattern => pattern.test(text))
  }

  function parseContent(content: string): ParsedMemory {
    const items: string[] = []
    const warnings: string[] = []
    let platform = 'chatgpt'
    
    try {
      // Try to parse as JSON
      const json = JSON.parse(content)
      
      // ChatGPT format
      if (Array.isArray(json)) {
        json.forEach((item: any) => {
          if (typeof item === 'string') {
            items.push(item)
          } else if (item.content || item.text || item.memory) {
            items.push(item.content || item.text || item.memory)
          }
        })
      } else if (json.memories || json.items || json.data) {
        const arr = json.memories || json.items || json.data
        arr.forEach((item: any) => {
          if (typeof item === 'string') {
            items.push(item)
          } else if (item.content || item.text) {
            items.push(item.content || item.text)
          }
        })
      }
      
      // Detect platform from content
      if (content.toLowerCase().includes('claude')) {
        platform = 'claude'
      }
    } catch {
      // Not JSON, treat as plain text
      const lines = content.split('\n').filter(line => line.trim())
      lines.forEach(line => {
        // Skip obvious headers/metadata
        if (!line.startsWith('#') && !line.startsWith('//') && line.length > 5) {
          items.push(line.trim())
        }
      })
    }
    
    // Check for sensitive info
    items.forEach((item, i) => {
      if (detectSensitive(item)) {
        warnings.push(`Item ${i + 1}: May contain sensitive information`)
      }
    })
    
    return { content, items, warnings, platform }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return
    
    setFile(uploadedFile)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const result = parseContent(content)
      setParsed(result)
      // Select all by default, except items with warnings
      const selected = new Set<number>()
      result.items.forEach((_, i) => {
        if (!result.warnings.some(w => w.startsWith(`Item ${i + 1}`))) {
          selected.add(i)
        }
      })
      setSelectedItems(selected)
      setTitle(uploadedFile.name.replace(/\.[^/.]+$/, ''))
      setStep('preview')
    }
    reader.readAsText(uploadedFile)
  }

  function handlePasteContinue() {
    if (!pasteContent.trim()) return
    
    const result = parseContent(pasteContent)
    setParsed(result)
    const selected = new Set<number>()
    result.items.forEach((_, i) => {
      if (!result.warnings.some(w => w.startsWith(`Item ${i + 1}`))) {
        selected.add(i)
      }
    })
    setSelectedItems(selected)
    setStep('preview')
  }

  async function handleSave() {
    if (!parsed || selectedItems.size === 0) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/import')
      return
    }
    
    setSaving(true)
    
    try {
      // Filter selected items
      const selectedContent = parsed.items
        .filter((_, i) => selectedItems.has(i))
      
      const res = await fetch('/api/memory-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: parsed.platform,
          title: title || txt.titlePlaceholder,
          description: `Imported ${selectedContent.length} items`,
          content: JSON.stringify(selectedContent, null, 2),
        }),
      })
      
      if (res.ok) {
        setStep('save')
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  function toggleItem(index: number) {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
  }

  function selectAll() {
    const newSelected = new Set<number>()
    parsed?.items.forEach((_, i) => newSelected.add(i))
    setSelectedItems(newSelected)
  }

  function deselectAll() {
    setSelectedItems(new Set())
  }

  return (
    <div className="min-h-[80vh] container mx-auto py-12 px-4 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Memory 导入向导</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{txt.title}</h1>
        <p className="text-gray-500">{txt.subtitle}</p>
      </div>

      {/* Step: Choose Method */}
      {step === 'choose' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-center mb-6">{txt.chooseMethod}</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all group"
              onClick={() => setStep('upload')}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileJson className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{txt.uploadFile}</h3>
                <p className="text-gray-500 text-sm">{txt.uploadDesc}</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all group"
              onClick={() => setStep('paste')}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ClipboardPaste className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{txt.pasteText}</h3>
                <p className="text-gray-500 text-sm">{txt.pasteDesc}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* How to export guide */}
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-6">
              <h3 className="font-medium mb-3">💡 {txt.howToExport}</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>{txt.step1}</li>
                <li>{txt.step2}</li>
                <li>{txt.step3}</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="font-medium text-lg mb-1">{txt.dropHere}</p>
              <p className="text-gray-500 text-sm mb-4">{txt.orClick}</p>
              <p className="text-xs text-gray-400">{txt.acceptFormats}</p>
            </div>
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          <Button variant="outline" onClick={() => setStep('choose')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {txt.back}
          </Button>
        </div>
      )}

      {/* Step: Paste */}
      {step === 'paste' && (
        <div className="space-y-6">
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder={txt.pasteHere}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('choose')} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {txt.back}
            </Button>
            <Button 
              onClick={handlePasteContinue} 
              disabled={!pasteContent.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 border-0"
            >
              {txt.continue}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && parsed && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{txt.preview}</h2>
            <span className="text-sm text-gray-500">
              {txt.foundItems.replace('{count}', String(parsed.items.length))}
            </span>
          </div>
          
          {/* Warnings */}
          {parsed.warnings.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">{txt.warnings}</p>
                    <p className="text-sm text-amber-700">{txt.warningDesc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Selection controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>{txt.selectAll}</Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>{txt.deselectAll}</Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
            >
              {showSensitive ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showSensitive ? txt.hideSensitive : txt.showSensitive}
            </Button>
          </div>
          
          {/* Items list */}
          <div className="max-h-80 overflow-y-auto space-y-2 border rounded-xl p-3">
            {parsed.items.map((item, i) => {
              const isSensitive = parsed.warnings.some(w => w.startsWith(`Item ${i + 1}`))
              if (isSensitive && !showSensitive) {
                return (
                  <div key={i} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(i)}
                      onChange={() => toggleItem(i)}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-amber-600 text-sm italic">
                      ⚠️ Sensitive item hidden - click show to review
                    </span>
                  </div>
                )
              }
              
              return (
                <div 
                  key={i} 
                  className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                    isSensitive ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(i)}
                    onChange={() => toggleItem(i)}
                    className="w-4 h-4 mt-1 accent-purple-600"
                  />
                  <span className={`text-sm flex-1 ${isSensitive ? 'text-amber-800' : 'text-gray-700'}`}>
                    {isSensitive && '⚠️ '}
                    {item.length > 200 ? item.slice(0, 200) + '...' : item}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Title input */}
          <div>
            <label className="block text-sm font-medium mb-1">{txt.memoryTitle}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={txt.titlePlaceholder}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('choose')} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {txt.back}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || selectedItems.size === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 border-0"
            >
              {saving ? txt.saving : txt.saveToBank}
              {!saving && <Check className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'save' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{txt.success}</h2>
          <p className="text-gray-500 mb-8">
            {selectedItems.size} items saved to Memory Bank
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => {
                setStep('choose')
                setParsed(null)
                setFile(null)
                setPasteContent('')
                setTitle('')
              }}
            >
              {txt.importMore}
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/memory-bank')}
              className="bg-gradient-to-r from-purple-600 to-pink-500 border-0"
            >
              <Brain className="w-4 h-4 mr-2" />
              {txt.goToBank}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
