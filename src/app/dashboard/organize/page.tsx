'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Sparkles, RefreshCw, AlertTriangle, Copy, Clock,
  FileText, Check, X, Merge, Trash2, ChevronDown, ChevronUp,
  Zap, Shield, Brain
} from 'lucide-react'

interface Memory {
  id: string
  title: string
  content: string | null
  description: string | null
  platform: string
  created_at: string
}

interface Issue {
  type: 'conflict' | 'duplicate' | 'long' | 'stale' | 'orphan'
  severity: 'high' | 'medium' | 'low'
  memories: Memory[]
  suggestion: string
  action?: string
}

interface OrganizeData {
  healthScore: number
  issues: Issue[]
  stats: {
    total: number
    duplicates: number
    conflicts: number
    longMemories: number
    staleMemories: number
    issueCount: number
  }
}

export default function OrganizePage() {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useTranslation()
  
  const [data, setData] = useState<OrganizeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  
  const texts = {
    en: {
      title: 'Smart Organize',
      subtitle: 'AI-powered memory organization',
      scanning: 'Analyzing your memories...',
      rescan: 'Rescan',
      
      healthScore: 'Memory Health Score',
      issuesFound: 'Issues Found',
      
      // Issue types
      conflict: 'Conflict',
      duplicate: 'Duplicate',
      long: 'Too Long',
      stale: 'Stale',
      
      // Stats
      total: 'Total Memories',
      conflicts: 'Conflicts',
      duplicates: 'Duplicates',
      longMemories: 'Too Long',
      staleMemories: 'Stale',
      
      // Actions
      merge: 'Merge',
      delete: 'Delete',
      ignore: 'Ignore',
      resolve: 'Resolve',
      split: 'Split',
      review: 'Review',
      
      // Status
      noIssues: 'Your memories are well organized!',
      processing: 'Processing...',
      
      // Severity
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    },
    zh: {
      title: '智能整理',
      subtitle: 'AI 驱动的记忆整理',
      scanning: '正在分析你的记忆...',
      rescan: '重新扫描',
      
      healthScore: '记忆健康分数',
      issuesFound: '发现的问题',
      
      conflict: '冲突',
      duplicate: '重复',
      long: '过长',
      stale: '过时',
      
      total: '记忆总数',
      conflicts: '冲突',
      duplicates: '重复',
      longMemories: '过长',
      staleMemories: '过时',
      
      merge: '合并',
      delete: '删除',
      ignore: '忽略',
      resolve: '解决',
      split: '拆分',
      review: '查看',
      
      noIssues: '你的记忆整理得很好！',
      processing: '处理中...',
      
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级',
    }
  }
  
  const txt = texts[locale]
  
  useEffect(() => {
    checkAuthAndFetch()
  }, [])
  
  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/organize')
      return
    }
    fetchData()
  }
  
  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/organize')
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function rescan() {
    setScanning(true)
    await fetchData()
    setScanning(false)
  }
  
  async function handleAction(issueIndex: number, action: string, memoryIds: string[]) {
    setProcessing(`${issueIndex}-${action}`)
    
    try {
      await fetch('/api/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, memoryIds })
      })
      
      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Action error:', error)
    } finally {
      setProcessing(null)
    }
  }
  
  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }
  
  function getScoreGradient(score: number) {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-amber-500'
    if (score >= 40) return 'from-orange-500 to-red-400'
    return 'from-red-500 to-rose-600'
  }
  
  function getIssueIcon(type: string) {
    switch (type) {
      case 'conflict': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'duplicate': return <Copy className="w-5 h-5 text-yellow-500" />
      case 'long': return <FileText className="w-5 h-5 text-orange-500" />
      case 'stale': return <Clock className="w-5 h-5 text-blue-500" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }
  
  function getSeverityBadge(severity: string) {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colors[severity as keyof typeof colors] || colors.low}`}>
        {txt[severity as keyof typeof txt] || severity}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Sparkles className="w-16 h-16 text-purple-300 animate-pulse" />
            <Zap className="w-6 h-6 text-purple-600 absolute -right-1 -top-1 animate-bounce" />
          </div>
          <p className="mt-4 text-gray-500">{txt.scanning}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            {txt.title}
          </h1>
          <p className="text-gray-500 mt-1">{txt.subtitle}</p>
        </div>
        <Button 
          onClick={rescan}
          disabled={scanning}
          variant="outline"
          className="btn-hover"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {txt.rescan}
        </Button>
      </div>
      
      {/* Health Score */}
      <Card className="mb-8 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${getScoreGradient(data?.healthScore || 100)}`} />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#organizeGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(data?.healthScore || 0) * 4.4} 440`}
                />
                <defs>
                  <linearGradient id="organizeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(data?.healthScore || 100)}`}>
                  {data?.healthScore || 100}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Brain className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{data?.stats.total || 0}</div>
                <div className="text-xs text-gray-500">{txt.total}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 mx-auto text-red-500 mb-2" />
                <div className="text-2xl font-bold text-red-600">{data?.stats.conflicts || 0}</div>
                <div className="text-xs text-gray-500">{txt.conflicts}</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <Copy className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{data?.stats.duplicates || 0}</div>
                <div className="text-xs text-gray-500">{txt.duplicates}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <FileText className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold text-orange-600">{data?.stats.longMemories || 0}</div>
                <div className="text-xs text-gray-500">{txt.longMemories}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Clock className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-blue-600">{data?.stats.staleMemories || 0}</div>
                <div className="text-xs text-gray-500">{txt.staleMemories}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {txt.issuesFound} ({data?.issues.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.issues.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-green-700 font-medium">{txt.noIssues}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.issues.map((issue, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div 
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                      issue.severity === 'high' ? 'bg-red-50' :
                      issue.severity === 'medium' ? 'bg-yellow-50' : 'bg-gray-50'
                    }`}
                    onClick={() => setExpandedIssue(expandedIssue === index ? null : index)}
                  >
                    <div className="flex items-center gap-3">
                      {getIssueIcon(issue.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {txt[issue.type as keyof typeof txt] || issue.type}
                          </span>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {issue.memories.length} memor{issue.memories.length === 1 ? 'y' : 'ies'} affected
                        </p>
                      </div>
                    </div>
                    {expandedIssue === index ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                  
                  {expandedIssue === index && (
                    <div className="border-t p-4 space-y-4">
                      {/* Suggestion */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">💡 {issue.suggestion}</p>
                      </div>
                      
                      {/* Affected Memories */}
                      <div className="space-y-2">
                        {issue.memories.map((memory, mIndex) => (
                          <div key={mIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{memory.title}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(memory.created_at).toLocaleDateString()} • {memory.platform}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 justify-end">
                        {issue.type === 'duplicate' && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(index, 'merge', issue.memories.map(m => m.id))}
                            disabled={processing === `${index}-merge`}
                            className="bg-gradient-to-r from-purple-600 to-pink-500"
                          >
                            <Merge className="w-4 h-4 mr-1" />
                            {processing === `${index}-merge` ? txt.processing : txt.merge}
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(index, 'delete', issue.memories.map(m => m.id))}
                          disabled={processing === `${index}-delete`}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {processing === `${index}-delete` ? txt.processing : txt.delete}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(index, 'ignore', issue.memories.map(m => m.id))}
                          disabled={processing === `${index}-ignore`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          {txt.ignore}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
