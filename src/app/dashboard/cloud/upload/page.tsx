'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { Upload, FileJson, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CloudUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [content, setContent] = useState<string>('')
  const [platform, setPlatform] = useState<'chatgpt' | 'claude'>('chatgpt')
  const [accountLabel, setAccountLabel] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { locale } = useTranslation()
  const router = useRouter()

  const texts = {
    en: {
      title: 'Upload Memory',
      subtitle: 'Backup your AI Memory to the cloud',
      dropzone: 'Drop your Memory JSON file here',
      or: 'or',
      browse: 'Browse files',
      paste: 'Or paste JSON content directly',
      platform: 'AI Platform',
      label: 'Account Label (optional)',
      labelPlaceholder: 'e.g., Work Account',
      upload: 'Upload & Sync',
      uploading: 'Uploading...',
      success: 'Memory synced successfully!',
      viewCloud: 'View Cloud Memory',
      back: 'Back',
      invalidFile: 'Please select a valid JSON file',
      emptyContent: 'Please provide Memory content',
    },
    zh: {
      title: '上传 Memory',
      subtitle: '将你的 AI Memory 备份到云端',
      dropzone: '拖拽 Memory JSON 文件到这里',
      or: '或者',
      browse: '选择文件',
      paste: '或者直接粘贴 JSON 内容',
      platform: 'AI 平台',
      label: '账号标签（可选）',
      labelPlaceholder: '例如：工作账号',
      upload: '上传并同步',
      uploading: '上传中...',
      success: 'Memory 同步成功！',
      viewCloud: '查看云端 Memory',
      back: '返回',
      invalidFile: '请选择有效的 JSON 文件',
      emptyContent: '请提供 Memory 内容',
    }
  }
  const t = texts[locale]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json') && !selectedFile.type.includes('json')) {
        setError(t.invalidFile)
        return
      }
      setFile(selectedFile)
      setError(null)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.json')) {
        setError(t.invalidFile)
        return
      }
      setFile(droppedFile)
      setError(null)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
      }
      reader.readAsText(droppedFile)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError(t.emptyContent)
      return
    }

    // 验证 JSON 格式
    try {
      JSON.parse(content)
    } catch {
      setError(locale === 'zh' ? 'JSON 格式无效' : 'Invalid JSON format')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const res = await fetch('/api/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          account_label: accountLabel || null,
          content,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (e) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t.success}</h1>
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/dashboard/cloud">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-500">
                {t.viewCloud}
              </Button>
            </Link>
            <Button variant="outline" onClick={() => {
              setSuccess(false)
              setFile(null)
              setContent('')
            }}>
              {locale === 'zh' ? '继续上传' : 'Upload Another'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/dashboard/cloud" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t.back}
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-gray-500 mb-8">{t.subtitle}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t.platform}</label>
          <div className="flex gap-3">
            <button
              onClick={() => setPlatform('chatgpt')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                platform === 'chatgpt'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🤖</span>
              <span className="block mt-1 font-medium">ChatGPT</span>
            </button>
            <button
              onClick={() => setPlatform('claude')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                platform === 'claude'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🧠</span>
              <span className="block mt-1 font-medium">Claude</span>
            </button>
          </div>
        </div>

        {/* Account Label */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t.label}</label>
          <input
            type="text"
            value={accountLabel}
            onChange={(e) => setAccountLabel(e.target.value)}
            placeholder={t.labelPlaceholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* File Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            file
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileJson className="w-8 h-8 text-purple-600" />
              <span className="font-medium">{file.name}</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">{t.dropzone}</p>
              <p className="text-gray-400 text-sm">{t.or}</p>
              <Button variant="outline" className="mt-2">{t.browse}</Button>
            </>
          )}
        </div>

        {/* Or paste JSON */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">{t.paste}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='{"memories": [...]}'
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={uploading || !content}
          className="w-full mt-6 h-12 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.uploading}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {t.upload}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
