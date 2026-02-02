'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Cloud, 
  RefreshCw, 
  Trash2, 
  History, 
  Download,
  Upload,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface CloudMemory {
  id: string
  platform: string
  account_label: string | null
  content: any
  sync_status: string
  last_synced_at: string | null
  created_at: string
  updated_at: string
  item_count: number
  preview: { key: string; value: string }[]
}

const platformIcons: Record<string, string> = {
  chatgpt: '🤖',
  claude: '🧠',
  gemini: '✨'
}

const platformNames: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini'
}

export default function CloudDashboardPage() {
  const [memories, setMemories] = useState<CloudMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { locale } = useTranslation()
  const router = useRouter()
  const supabase = createClient()

  const texts = {
    en: {
      title: 'Cloud Memory',
      subtitle: 'Manage your AI Memory backups',
      empty: 'No cloud memories yet',
      emptyDesc: 'Sync your first Memory to get started',
      syncNow: 'Sync Now',
      lastSynced: 'Last synced',
      items: 'items',
      viewHistory: 'View History',
      delete: 'Delete',
      download: 'Download',
      upgrade: 'Upgrade to Pro',
      upgradeDesc: 'Get cloud sync, version history, and more',
      howToSync: 'How to sync your Memory',
      step1: '1. Install the Chrome Extension',
      step2: '2. Open ChatGPT and go to Memory settings',
      step3: '3. Click "Backup to xmemory"',
      comingSoon: 'Chrome Extension coming soon!',
      manualUpload: 'Manual Upload',
    },
    zh: {
      title: '云端 Memory',
      subtitle: '管理你的 AI Memory 备份',
      empty: '还没有云端 Memory',
      emptyDesc: '同步你的第一个 Memory 开始使用',
      syncNow: '立即同步',
      lastSynced: '上次同步',
      items: '条记录',
      viewHistory: '查看历史',
      delete: '删除',
      download: '下载',
      upgrade: '升级到 Pro',
      upgradeDesc: '获取云同步、版本历史等更多功能',
      howToSync: '如何同步你的 Memory',
      step1: '1. 安装 Chrome 扩展',
      step2: '2. 打开 ChatGPT，进入 Memory 设置',
      step3: '3. 点击「备份到 xmemory」',
      comingSoon: 'Chrome 扩展即将推出！',
      manualUpload: '手动上传',
    }
  }
  const t = texts[locale]

  useEffect(() => {
    fetchMemories()
  }, [])

  async function fetchMemories() {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/cloud/memories')
      const data = await res.json()
      
      if (res.ok) {
        setMemories(data.memories)
      } else {
        if (res.status === 401) {
          router.push('/auth/login')
        } else {
          setError(data.error)
        }
      }
    } catch (e) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个 Memory 吗？所有版本历史也会被删除。')) {
      return
    }
    
    try {
      const res = await fetch(`/api/cloud/memories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMemories(memories.filter(m => m.id !== id))
      }
    } catch (e) {
      alert('删除失败')
    }
  }

  function handleDownload(memory: CloudMemory) {
    // 使用 API 下载，确保获取完整内容
    window.location.href = `/api/cloud/memories/${memory.id}/download`
  }

  function formatTime(dateString: string | null) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return locale === 'zh' ? '刚刚' : 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${locale === 'zh' ? '分钟前' : 'min ago'}`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${locale === 'zh' ? '小时前' : 'h ago'}`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cloud className="w-8 h-8 text-purple-600" />
            {t.title}
          </h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchMemories}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {locale === 'zh' ? '刷新' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {memories.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t.empty}</h2>
          <p className="text-gray-500 mb-8">{t.emptyDesc}</p>
          
          <div className="max-w-md mx-auto bg-white rounded-xl p-6 text-left shadow-sm">
            <h3 className="font-semibold mb-4">{t.howToSync}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                {t.step1}
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                {t.step2}
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
                {t.step3}
              </p>
            </div>
            <div className="mt-6 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
              ⏳ {t.comingSoon}
            </div>
            <Link href="/dashboard/cloud/upload">
              <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-500">
                <Upload className="w-4 h-4 mr-2" />
                {t.manualUpload}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Memory List */
        <div className="space-y-4">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                    {platformIcons[memory.platform] || '🤖'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {platformNames[memory.platform] || memory.platform}
                      {memory.account_label && (
                        <span className="text-sm font-normal text-gray-500">
                          ({memory.account_label})
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        {memory.sync_status === 'synced' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                        {t.lastSynced}: {formatTime(memory.last_synced_at)}
                      </span>
                      <span>
                        {memory.item_count} {t.items}
                      </span>
                    </div>
                    
                    {/* Preview */}
                    {memory.preview && memory.preview.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {memory.preview.map((item, i) => (
                          <div key={i} className="text-sm text-gray-600 truncate max-w-xl">
                            <span className="font-medium">{item.key}:</span> {item.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/cloud/${memory.id}/history`}>
                    <Button variant="ghost" size="sm">
                      <History className="w-4 h-4 mr-1" />
                      {t.viewHistory}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(memory)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(memory.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{t.upgrade}</h3>
            <p className="text-purple-100 mt-1">{t.upgradeDesc}</p>
          </div>
          <Button className="bg-white text-purple-600 hover:bg-purple-50">
            {t.upgrade}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
