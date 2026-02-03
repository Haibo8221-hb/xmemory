'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Plus, Search, Trash2, Edit, Download, Upload, 
  Brain, Bot, Sparkles, MoreHorizontal, Clock, 
  Shield, ChevronDown, FileJson, Eye, EyeOff
} from 'lucide-react'

interface UserMemory {
  id: string
  platform: string
  title: string
  description: string | null
  content: string | null
  notes: string | null
  version: number
  created_at: string
  updated_at: string
}

const platformIcons: Record<string, React.ReactNode> = {
  chatgpt: <Bot className="w-5 h-5 text-green-600" />,
  claude: <Sparkles className="w-5 h-5 text-orange-500" />,
  gemini: <Brain className="w-5 h-5 text-blue-500" />,
  other: <MoreHorizontal className="w-5 h-5 text-gray-500" />,
}

const platformColors: Record<string, string> = {
  chatgpt: 'from-green-500 to-emerald-600',
  claude: 'from-orange-500 to-amber-600',
  gemini: 'from-blue-500 to-indigo-600',
  other: 'from-gray-500 to-slate-600',
}

export default function MemoryBankPage() {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useTranslation()
  
  const [memories, setMemories] = useState<UserMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMemory, setEditingMemory] = useState<UserMemory | null>(null)
  const [showContent, setShowContent] = useState<Record<string, boolean>>({})
  
  const texts = {
    en: {
      title: 'My Library',
      subtitle: 'Your private AI content storage',
      addNew: 'Add Content',
      search: 'Search...',
      all: 'All Platforms',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      other: 'Other',
      noMemories: 'No content stored yet',
      startAdding: 'Start by adding your first content',
      version: 'v',
      lastUpdated: 'Last updated',
      viewContent: 'View Content',
      hideContent: 'Hide Content',
      edit: 'Edit',
      delete: 'Delete',
      export: 'Export',
      confirmDelete: 'Are you sure you want to delete this?',
      private: 'Private & Encrypted',
      memoryCount: 'items',
    },
    zh: {
      title: '内容库',
      subtitle: '你的私人AI内容存储',
      addNew: '添加内容',
      search: '搜索...',
      all: '全部平台',
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      other: '其他',
      noMemories: '还没有存储任何内容',
      startAdding: '开始添加你的第一个内容',
      version: 'v',
      lastUpdated: '最后更新',
      viewContent: '查看内容',
      hideContent: '隐藏内容',
      edit: '编辑',
      delete: '删除',
      export: '导出',
      confirmDelete: '确定要删除吗？',
      private: '私密加密存储',
      memoryCount: '项内容',
    }
  }
  
  const txt = texts[locale]
  
  useEffect(() => {
    checkAuthAndFetch()
  }, [selectedPlatform])
  
  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/memory-bank')
      return
    }
    fetchMemories()
  }
  
  async function fetchMemories() {
    setLoading(true)
    try {
      const params = selectedPlatform !== 'all' ? `?platform=${selectedPlatform}` : ''
      const res = await fetch(`/api/memory-bank${params}`)
      const data = await res.json()
      setMemories(data.memories || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function deleteMemory(id: string) {
    if (!confirm(txt.confirmDelete)) return
    
    try {
      await fetch(`/api/memory-bank?id=${id}`, { method: 'DELETE' })
      setMemories(memories.filter(m => m.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }
  
  function exportMemory(memory: UserMemory) {
    const content = memory.content || ''
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${memory.title.replace(/\s+/g, '_')}_${memory.platform}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const filteredMemories = memories.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const platformCounts = memories.reduce((acc, m) => {
    acc[m.platform] = (acc[m.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">{txt.title}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Shield className="w-4 h-4 text-green-500" />
            {txt.subtitle} • {txt.private}
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          {txt.addNew}
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {['all', 'chatgpt', 'claude', 'gemini', 'other'].map(platform => (
          <Card 
            key={platform}
            className={`card-hover cursor-pointer border-2 transition-all ${
              selectedPlatform === platform 
                ? 'border-purple-500 shadow-lg shadow-purple-100' 
                : 'border-transparent'
            }`}
            onClick={() => setSelectedPlatform(platform)}
          >
            <CardContent className="pt-4 pb-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {platform === 'all' ? (
                  <Brain className="w-6 h-6 text-purple-600" />
                ) : platformIcons[platform]}
              </div>
              <div className="text-2xl font-bold">
                {platform === 'all' ? memories.length : (platformCounts[platform] || 0)}
              </div>
              <div className="text-xs text-gray-500">
                {txt[platform as keyof typeof txt]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={txt.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Memory List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : filteredMemories.length > 0 ? (
        <div className="space-y-4">
          {filteredMemories.map(memory => (
            <Card key={memory.id} className="card-hover border-0 shadow-md overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${platformColors[memory.platform]}`} />
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platformColors[memory.platform]} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white">{platformIcons[memory.platform]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{memory.title}</h3>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                          {txt.version}{memory.version}
                        </span>
                      </div>
                      {memory.description && (
                        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{memory.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {txt.lastUpdated}: {new Date(memory.updated_at).toLocaleDateString()}
                        </span>
                        <span className="uppercase">{memory.platform}</span>
                      </div>
                      
                      {/* Content Preview */}
                      {showContent[memory.id] && memory.content && (
                        <pre className="mt-3 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto max-h-48">
                          {memory.content.slice(0, 1000)}
                          {memory.content.length > 1000 && '...'}
                        </pre>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowContent(prev => ({ ...prev, [memory.id]: !prev[memory.id] }))}
                      title={showContent[memory.id] ? txt.hideContent : txt.viewContent}
                    >
                      {showContent[memory.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportMemory(memory)}
                      title={txt.export}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMemory(memory)}
                      title={txt.edit}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMemory(memory.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      title={txt.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">{txt.noMemories}</p>
            <p className="text-gray-400 text-sm mb-6">{txt.startAdding}</p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              {txt.addNew}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Add/Edit Modal */}
      {(showAddModal || editingMemory) && (
        <MemoryModal
          memory={editingMemory}
          onClose={() => {
            setShowAddModal(false)
            setEditingMemory(null)
          }}
          onSave={() => {
            setShowAddModal(false)
            setEditingMemory(null)
            fetchMemories()
          }}
          locale={locale}
        />
      )}
    </div>
  )
}

// Modal Component
interface MemoryModalProps {
  memory: UserMemory | null
  onClose: () => void
  onSave: () => void
  locale: 'en' | 'zh'
}

function MemoryModal({ memory, onClose, onSave, locale }: MemoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    platform: memory?.platform || 'chatgpt',
    title: memory?.title || '',
    description: memory?.description || '',
    content: memory?.content || '',
    notes: memory?.notes || '',
  })
  
  const texts = {
    en: {
      addTitle: 'Add New Memory',
      editTitle: 'Edit Memory',
      platform: 'Platform',
      title: 'Title',
      titlePlaceholder: 'e.g., My ChatGPT Memory Backup',
      description: 'Description',
      descPlaceholder: 'What is this memory about?',
      content: 'Memory Content (JSON)',
      contentPlaceholder: 'Paste your exported memory content here...',
      notes: 'Private Notes',
      notesPlaceholder: 'Any notes for yourself...',
      cancel: 'Cancel',
      save: 'Save Memory',
      saving: 'Saving...',
      uploadFile: 'Or upload file',
    },
    zh: {
      addTitle: '添加新Memory',
      editTitle: '编辑Memory',
      platform: '平台',
      title: '标题',
      titlePlaceholder: '例如：我的ChatGPT Memory备份',
      description: '描述',
      descPlaceholder: '这个Memory是关于什么的？',
      content: 'Memory内容 (JSON)',
      contentPlaceholder: '粘贴导出的Memory内容...',
      notes: '私人备注',
      notesPlaceholder: '给自己的备注...',
      cancel: '取消',
      save: '保存Memory',
      saving: '保存中...',
      uploadFile: '或上传文件',
    }
  }
  
  const txt = texts[locale]
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const method = memory ? 'PATCH' : 'POST'
      const body = memory ? { ...form, id: memory.id } : form
      
      const res = await fetch('/api/memory-bank', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setForm(prev => ({ ...prev, content }))
      if (!form.title) {
        setForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }))
      }
    }
    reader.readAsText(file)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold">
            {memory ? txt.editTitle : txt.addTitle}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Platform */}
          <div>
            <label className="block text-sm font-medium mb-1">{txt.platform}</label>
            <div className="flex gap-2">
              {['chatgpt', 'claude', 'gemini', 'other'].map(p => (
                <Button
                  key={p}
                  type="button"
                  variant={form.platform === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setForm(prev => ({ ...prev, platform: p }))}
                  className={form.platform === p ? `bg-gradient-to-r ${platformColors[p]} border-0` : ''}
                >
                  {platformIcons[p]}
                  <span className="ml-2 capitalize">{p}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">{txt.title}</label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder={txt.titlePlaceholder}
              required
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">{txt.description}</label>
            <Input
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder={txt.descPlaceholder}
            />
          </div>
          
          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">{txt.content}</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder={txt.contentPlaceholder}
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{txt.uploadFile}</span>
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">{txt.notes}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={txt.notesPlaceholder}
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {txt.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-500 border-0"
            >
              {loading ? txt.saving : txt.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
