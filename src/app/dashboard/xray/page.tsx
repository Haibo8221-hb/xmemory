'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, 
  Eye, User, MapPin, Building, Calendar, Mail, Phone,
  ChevronDown, ChevronUp, Trash2, Edit, RefreshCw,
  Brain, Zap, Lock
} from 'lucide-react'

interface PrivacyIssue {
  type: 'high' | 'medium' | 'low'
  category: string
  pattern: string
  match: string
  suggestion: string
}

interface AnalyzedMemory {
  id: string
  title: string
  content: string
  platform: string
  created_at: string
  privacy: {
    score: number
    issues: PrivacyIssue[]
    entities: {
      names: string[]
      locations: string[]
      organizations: string[]
      dates: string[]
      emails: string[]
      phones: string[]
    }
  }
  autoCategory: {
    category: string
    subcategory?: string
    tags: string[]
  }
}

interface XRayData {
  memories: AnalyzedMemory[]
  stats: {
    total: number
    avgPrivacyScore: number
    highRiskCount: number
    mediumRiskCount: number
    safeCount: number
  }
  entities: {
    names: string[]
    locations: string[]
    organizations: string[]
    dates: string[]
  }
  byCategory: Record<string, AnalyzedMemory[]>
}

export default function XRayPage() {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useTranslation()
  
  const [data, setData] = useState<XRayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'privacy' | 'timeline'>('overview')
  
  const texts = {
    en: {
      title: 'Memory X-Ray',
      subtitle: 'See what your AI knows about you',
      scanning: 'Scanning your memories...',
      rescan: 'Rescan All',
      
      // Stats
      healthScore: 'Memory Health Score',
      totalMemories: 'Total Memories',
      highRisk: 'High Risk',
      mediumRisk: 'Medium Risk',
      safe: 'Safe',
      
      // Tabs
      overview: 'Overview',
      privacy: 'Privacy Alerts',
      timeline: 'Timeline',
      
      // Entities
      whoYouAre: 'Who You Are',
      names: 'Names',
      locations: 'Locations',
      organizations: 'Organizations',
      timeline_dates: 'Key Dates',
      
      // Issues
      highRiskTitle: 'High Risk Issues',
      mediumRiskTitle: 'Medium Risk Issues',
      lowRiskTitle: 'Low Risk Items',
      noIssues: 'No privacy issues found!',
      
      // Actions
      delete: 'Delete',
      edit: 'Edit',
      ignore: 'Ignore',
      
      // Categories
      byCategory: 'By Category',
      work: 'Work',
      personal: 'Personal',
      learning: 'Learning',
      health: 'Health',
      finance: 'Finance',
      preferences: 'Preferences',
      other: 'Other',
    },
    zh: {
      title: '记忆透视',
      subtitle: '看看 AI 眼中的你',
      scanning: '正在扫描你的记忆...',
      rescan: '重新扫描',
      
      healthScore: '记忆健康分数',
      totalMemories: '记忆总数',
      highRisk: '高风险',
      mediumRisk: '中风险',
      safe: '安全',
      
      overview: '总览',
      privacy: '隐私警报',
      timeline: '时间线',
      
      whoYouAre: 'AI 认为你是',
      names: '姓名',
      locations: '位置',
      organizations: '组织',
      timeline_dates: '关键日期',
      
      highRiskTitle: '高风险问题',
      mediumRiskTitle: '中风险问题',
      lowRiskTitle: '低风险项目',
      noIssues: '没有发现隐私问题！',
      
      delete: '删除',
      edit: '编辑',
      ignore: '忽略',
      
      byCategory: '按分类',
      work: '工作',
      personal: '个人',
      learning: '学习',
      health: '健康',
      finance: '财务',
      preferences: '偏好',
      other: '其他',
    }
  }
  
  const txt = texts[locale]
  
  useEffect(() => {
    checkAuthAndFetch()
  }, [])
  
  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/xray')
      return
    }
    fetchXRayData()
  }
  
  async function fetchXRayData() {
    setLoading(true)
    try {
      const res = await fetch('/api/xray')
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function rescanAll() {
    setScanning(true)
    await fetchXRayData()
    setScanning(false)
  }
  
  // Get score color
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
  
  // All memories with issues
  const memoriesWithIssues = data?.memories.filter(m => m.privacy.issues.length > 0) || []
  const highRiskMemories = memoriesWithIssues.filter(m => m.privacy.issues.some(i => i.type === 'high'))
  const mediumRiskMemories = memoriesWithIssues.filter(m => 
    !m.privacy.issues.some(i => i.type === 'high') && 
    m.privacy.issues.some(i => i.type === 'medium')
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Brain className="w-16 h-16 text-purple-300 animate-pulse" />
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
            <Eye className="w-8 h-8" />
            {txt.title}
          </h1>
          <p className="text-gray-500 mt-1">{txt.subtitle}</p>
        </div>
        <Button 
          onClick={rescanAll}
          disabled={scanning}
          variant="outline"
          className="btn-hover"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {txt.rescan}
        </Button>
      </div>
      
      {/* Health Score Card */}
      <Card className="mb-8 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${getScoreGradient(data?.stats.avgPrivacyScore || 100)}`} />
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
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(data?.stats.avgPrivacyScore || 0) * 4.4} 440`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(data?.stats.avgPrivacyScore || 100)}`}>
                  {data?.stats.avgPrivacyScore || 100}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Brain className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{data?.stats.total || 0}</div>
                <div className="text-xs text-gray-500">{txt.totalMemories}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 mx-auto text-red-500 mb-2" />
                <div className="text-2xl font-bold text-red-600">{data?.stats.highRiskCount || 0}</div>
                <div className="text-xs text-gray-500">{txt.highRisk}</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <AlertCircle className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{data?.stats.mediumRiskCount || 0}</div>
                <div className="text-xs text-gray-500">{txt.mediumRisk}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold text-green-600">{data?.stats.safeCount || 0}</div>
                <div className="text-xs text-gray-500">{txt.safe}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'privacy', 'timeline'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'bg-gradient-to-r from-purple-600 to-pink-500' : ''}
          >
            {txt[tab]}
          </Button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Entities - Who You Are */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {txt.whoYouAre}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.entities.names.length ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">{txt.names}</div>
                  <div className="flex flex-wrap gap-2">
                    {data.entities.names.map((name, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {data?.entities.locations.length ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {txt.locations}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.entities.locations.map((loc, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {data?.entities.organizations.length ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Building className="w-4 h-4" /> {txt.organizations}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.entities.organizations.map((org, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {org}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {!data?.entities.names.length && !data?.entities.locations.length && !data?.entities.organizations.length && (
                <p className="text-gray-400 text-sm">No personal information detected yet.</p>
              )}
            </CardContent>
          </Card>
          
          {/* By Category */}
          <Card>
            <CardHeader>
              <CardTitle>{txt.byCategory}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data?.byCategory || {}).map(([category, memories]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {category === 'work' ? '💼' : 
                         category === 'personal' ? '🏠' : 
                         category === 'learning' ? '📚' : 
                         category === 'health' ? '💪' : 
                         category === 'finance' ? '💰' : 
                         category === 'preferences' ? '⚙️' : '📦'}
                      </span>
                      <span className="capitalize">{txt[category as keyof typeof txt] || category}</span>
                    </div>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                      {memories.length}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* High Risk */}
          {highRiskMemories.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  {txt.highRiskTitle} ({highRiskMemories.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {highRiskMemories.map(memory => (
                    <PrivacyIssueCard 
                      key={memory.id} 
                      memory={memory}
                      expanded={expandedMemory === memory.id}
                      onToggle={() => setExpandedMemory(expandedMemory === memory.id ? null : memory.id)}
                      txt={txt}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Medium Risk */}
          {mediumRiskMemories.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader className="bg-yellow-50">
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="w-5 h-5" />
                  {txt.mediumRiskTitle} ({mediumRiskMemories.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {mediumRiskMemories.map(memory => (
                    <PrivacyIssueCard 
                      key={memory.id} 
                      memory={memory}
                      expanded={expandedMemory === memory.id}
                      onToggle={() => setExpandedMemory(expandedMemory === memory.id ? null : memory.id)}
                      txt={txt}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* No Issues */}
          {memoriesWithIssues.length === 0 && (
            <Card className="border-green-200">
              <CardContent className="py-12 text-center">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-green-700 font-medium">{txt.noIssues}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {activeTab === 'timeline' && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              {/* Timeline items */}
              <div className="space-y-6">
                {(data?.memories || []).slice(0, 20).map((memory, i) => (
                  <div key={memory.id} className="relative pl-10">
                    {/* Dot */}
                    <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                      memory.privacy.score < 60 ? 'bg-red-500' : 
                      memory.privacy.score < 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    
                    {/* Content */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{memory.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(memory.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-sm font-medium ${getScoreColor(memory.privacy.score)}`}>
                          {memory.privacy.score}/100
                        </div>
                      </div>
                      {memory.autoCategory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.autoCategory.tags.map((tag, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Privacy Issue Card Component
function PrivacyIssueCard({ 
  memory, 
  expanded, 
  onToggle,
  txt 
}: { 
  memory: AnalyzedMemory
  expanded: boolean
  onToggle: () => void
  txt: Record<string, string>
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-gray-400" />
          <div>
            <h4 className="font-medium">{memory.title}</h4>
            <p className="text-sm text-gray-500">
              {memory.privacy.issues.length} issue(s) found
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>
      
      {expanded && (
        <div className="border-t p-4 bg-gray-50 space-y-3">
          {memory.privacy.issues.map((issue, i) => (
            <div key={i} className={`p-3 rounded-lg ${
              issue.type === 'high' ? 'bg-red-100' : 
              issue.type === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-sm font-medium ${
                    issue.type === 'high' ? 'text-red-700' : 
                    issue.type === 'medium' ? 'text-yellow-700' : 'text-blue-700'
                  }`}>
                    {issue.pattern}
                  </span>
                  <p className="text-sm mt-1 font-mono bg-white/50 px-2 py-1 rounded">
                    {issue.match}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 {issue.suggestion}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
