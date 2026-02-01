'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { 
  History, 
  RotateCcw, 
  Download, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  Edit3
} from 'lucide-react'
import Link from 'next/link'

interface Version {
  id: string
  version_number: number
  diff: {
    added: any[]
    removed: any[]
    modified: any[]
    summary: string
  } | null
  created_by: string
  created_at: string
}

interface VersionDetail {
  id: string
  version_number: number
  content: any
  diff: any
  created_at: string
}

export default function VersionHistoryPage() {
  const params = useParams()
  const id = params.id as string
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null)
  const [versionDetail, setVersionDetail] = useState<VersionDetail | null>(null)
  const [restoring, setRestoring] = useState<number | null>(null)
  const { locale } = useTranslation()
  const router = useRouter()

  const texts = {
    en: {
      title: 'Version History',
      subtitle: 'View and restore previous versions',
      empty: 'No version history yet',
      restore: 'Restore',
      restoring: 'Restoring...',
      download: 'Download',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      current: 'Current',
      back: 'Back to Cloud',
      added: 'Added',
      removed: 'Removed',
      modified: 'Modified',
      restoreConfirm: 'Restore to this version?',
      restoreSuccess: 'Restored successfully!',
      createdBy: {
        sync: 'Auto Sync',
        manual: 'Manual',
        restore: 'Restored',
        auto: 'Auto',
      }
    },
    zh: {
      title: '版本历史',
      subtitle: '查看和恢复之前的版本',
      empty: '暂无版本历史',
      restore: '恢复',
      restoring: '恢复中...',
      download: '下载',
      viewDetails: '查看详情',
      hideDetails: '收起详情',
      current: '当前版本',
      back: '返回云端',
      added: '新增',
      removed: '删除',
      modified: '修改',
      restoreConfirm: '确定恢复到此版本吗？',
      restoreSuccess: '恢复成功！',
      createdBy: {
        sync: '自动同步',
        manual: '手动',
        restore: '恢复操作',
        auto: '自动',
      }
    }
  }
  const t = texts[locale]

  useEffect(() => {
    fetchVersions()
  }, [id])

  async function fetchVersions() {
    setLoading(true)
    try {
      const res = await fetch(`/api/cloud/memories/${id}/versions`)
      const data = await res.json()
      
      if (res.ok) {
        setVersions(data.versions)
      } else {
        setError(data.error)
      }
    } catch (e) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleExpand(versionNumber: number) {
    if (expandedVersion === versionNumber) {
      setExpandedVersion(null)
      setVersionDetail(null)
      return
    }

    setExpandedVersion(versionNumber)
    
    try {
      const res = await fetch(`/api/cloud/memories/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_number: versionNumber }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setVersionDetail(data.version)
      }
    } catch (e) {
      console.error('Failed to load version detail')
    }
  }

  async function handleRestore(versionNumber: number) {
    if (!confirm(t.restoreConfirm)) return

    setRestoring(versionNumber)
    try {
      const res = await fetch(`/api/cloud/memories/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_number: versionNumber }),
      })

      if (res.ok) {
        alert(t.restoreSuccess)
        fetchVersions()
      }
    } catch (e) {
      alert('恢复失败')
    } finally {
      setRestoring(null)
    }
  }

  function handleDownload(version: VersionDetail) {
    const content = version.content?.raw || JSON.stringify(version.content, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-v${version.version_number}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
      <Link href="/dashboard/cloud" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t.back}
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <History className="w-8 h-8 text-purple-600" />
          {t.title}
        </h1>
        <p className="text-gray-500 mb-8">{t.subtitle}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {versions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t.empty}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className="font-bold">#{version.version_number}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatTime(version.created_at)}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {t.current}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{t.createdBy[version.created_by as keyof typeof t.createdBy] || version.created_by}</span>
                        {version.diff && (
                          <span className="flex items-center gap-2">
                            {version.diff.added?.length > 0 && (
                              <span className="flex items-center text-green-600">
                                <Plus className="w-3 h-3" />{version.diff.added.length}
                              </span>
                            )}
                            {version.diff.removed?.length > 0 && (
                              <span className="flex items-center text-red-600">
                                <Minus className="w-3 h-3" />{version.diff.removed.length}
                              </span>
                            )}
                            {version.diff.modified?.length > 0 && (
                              <span className="flex items-center text-amber-600">
                                <Edit3 className="w-3 h-3" />{version.diff.modified.length}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {index !== 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version.version_number)}
                        disabled={restoring === version.version_number}
                      >
                        {restoring === version.version_number ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            {t.restoring}
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {t.restore}
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExpand(version.version_number)}
                    >
                      {expandedVersion === version.version_number ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          {t.hideDetails}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          {t.viewDetails}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedVersion === version.version_number && versionDetail && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Diff Summary */}
                    {versionDetail.diff && (
                      <div className="mb-4 space-y-2">
                        {versionDetail.diff.added?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-green-600">{t.added}:</span>
                            <ul className="mt-1 space-y-1">
                              {versionDetail.diff.added.map((item: any, i: number) => (
                                <li key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-green-300">
                                  {item.key}: {item.value?.substring(0, 100)}...
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {versionDetail.diff.removed?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-red-600">{t.removed}:</span>
                            <ul className="mt-1 space-y-1">
                              {versionDetail.diff.removed.map((item: any, i: number) => (
                                <li key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-red-300 line-through">
                                  {item.key}: {item.value?.substring(0, 100)}...
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Preview */}
                    <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-auto max-h-64">
                      <pre>{JSON.stringify(versionDetail.content?.items || versionDetail.content, null, 2)}</pre>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(versionDetail)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {t.download}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
