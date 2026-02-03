'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileJson, ClipboardPaste, Check, X, AlertTriangle, ArrowLeft } from 'lucide-react'

interface ParsedMemory {
  content: string
  selected: boolean
  hasPrivacy: boolean
}

export default function ImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload')
  const [memories, setMemories] = useState<ParsedMemory[]>([])
  const [importMethod, setImportMethod] = useState<'json' | 'text' | null>(null)
  const [textInput, setTextInput] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Privacy keywords to detect
  const privacyKeywords = ['地址', '电话', '手机', '身份证', '银行', '密码', '住在', '家在', 'address', 'phone', 'password', 'ssn', 'credit card']

  const detectPrivacy = (content: string): boolean => {
    return privacyKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
  }

  const parseJsonFile = (content: string): ParsedMemory[] => {
    try {
      const data = JSON.parse(content)
      
      // Handle ChatGPT export format
      if (data.memories && Array.isArray(data.memories)) {
        return data.memories.map((m: any) => ({
          content: m.content || m.text || String(m),
          selected: true,
          hasPrivacy: detectPrivacy(m.content || m.text || String(m))
        }))
      }
      
      // Handle array format
      if (Array.isArray(data)) {
        return data.map((m: any) => ({
          content: typeof m === 'string' ? m : m.content || m.text || JSON.stringify(m),
          selected: true,
          hasPrivacy: detectPrivacy(typeof m === 'string' ? m : m.content || '')
        }))
      }
      
      throw new Error('无法识别的JSON格式')
    } catch (e) {
      throw new Error('JSON解析失败：' + (e as Error).message)
    }
  }

  const parseTextInput = (text: string): ParsedMemory[] => {
    // Split by newlines and filter empty lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('#')) // Remove markdown headers
    
    return lines.map(content => ({
      content,
      selected: true,
      hasPrivacy: detectPrivacy(content)
    }))
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [])

  const handleFile = async (file: File) => {
    setError(null)
    
    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      setError('请上传 .json 或 .txt 文件')
      return
    }
    
    try {
      const content = await file.text()
      const parsed = file.name.endsWith('.json') 
        ? parseJsonFile(content) 
        : parseTextInput(content)
      
      if (parsed.length === 0) {
        setError('未找到有效的记忆内容')
        return
      }
      
      setMemories(parsed)
      setImportMethod('json')
      setStep('preview')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleTextImport = () => {
    setError(null)
    
    if (!textInput.trim()) {
      setError('请输入内容')
      return
    }
    
    const parsed = parseTextInput(textInput)
    if (parsed.length === 0) {
      setError('未找到有效的记忆内容')
      return
    }
    
    setMemories(parsed)
    setImportMethod('text')
    setStep('preview')
  }

  const toggleMemory = (index: number) => {
    setMemories(prev => prev.map((m, i) => 
      i === index ? { ...m, selected: !m.selected } : m
    ))
  }

  const selectAll = (selected: boolean) => {
    setMemories(prev => prev.map(m => ({ ...m, selected })))
  }

  const doImport = async () => {
    setStep('importing')
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    const toImport = memories.filter(m => m.selected)
    
    const { error } = await supabase
      .from('memories')
      .insert(toImport.map(m => ({
        user_id: user.id,
        content: m.content,
        source: importMethod === 'json' ? 'chatgpt' : 'manual',
        tags: []
      })))
    
    if (error) {
      setError('导入失败：' + error.message)
      setStep('preview')
      return
    }
    
    setImportedCount(toImport.length)
    setStep('done')
  }

  const selectedCount = memories.filter(m => m.selected).length
  const privacyCount = memories.filter(m => m.hasPrivacy && m.selected).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/bank" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">📥 导入记忆</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* JSON Upload */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
              }`}
            >
              <FileJson className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">拖拽 JSON 文件到这里</p>
              <p className="text-sm text-gray-500 mb-4">支持 ChatGPT Memory 导出格式</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <Upload className="w-4 h-4" />
                <span>选择文件</span>
                <input 
                  type="file" 
                  accept=".json,.txt" 
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm text-gray-500">或</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Text Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-gray-400" />
                <span className="font-medium">粘贴文本导入</span>
              </div>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="每行一条记忆，例如：&#10;用户是Python开发者&#10;偏好简洁的代码风格&#10;用中文回复"
                className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800"
              />
              <button
                onClick={handleTextImport}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90"
              >
                解析并预览
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            {/* Help Link */}
            <div className="text-center">
              <Link href="/docs/export" className="text-sm text-purple-600 hover:underline">
                💡 如何导出 ChatGPT Memory？
              </Link>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">📋 导入预览</h2>
                <p className="text-sm text-gray-500">
                  发现 {memories.length} 条记忆，已选中 {selectedCount} 条
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={doImport}
                  disabled={selectedCount === 0}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  导入 {selectedCount} 条
                </button>
              </div>
            </div>

            {privacyCount > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">检测到 {privacyCount} 条可能包含隐私信息</p>
                  <p className="text-sm">建议取消勾选后再导入，以保护个人隐私</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <button onClick={() => selectAll(true)} className="text-purple-600 hover:underline">
                全选
              </button>
              <button onClick={() => selectAll(false)} className="text-purple-600 hover:underline">
                取消全选
              </button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {memories.map((memory, index) => (
                <div
                  key={index}
                  onClick={() => toggleMemory(index)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    memory.selected 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  } ${memory.hasPrivacy ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      memory.selected 
                        ? 'bg-purple-600 border-purple-600 text-white' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {memory.selected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">{memory.content}</p>
                      {memory.hasPrivacy && (
                        <p className="text-xs text-yellow-600 mt-1">⚠️ 可能包含隐私信息</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step: Importing */}
        {step === 'importing' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-lg">正在导入...</p>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold mb-2">导入完成！</h2>
            <p className="text-gray-500 mb-6">成功导入 {importedCount} 条记忆</p>
            <Link
              href="/bank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90"
            >
              前往 Memory Bank
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
