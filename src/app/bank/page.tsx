'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Upload, Settings, FolderOpen, Tag, FileText } from 'lucide-react'

interface Skill {
  id: string
  name: string
  description: string | null
  icon: string
  sort_order: number
  memory_count?: number
}

interface Memory {
  id: string
  content: string
  source: string
  skill_id: string | null
  tags: string[] | null
  created_at: string
}

export default function MemoryBankPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, selectedSkill])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
  }

  async function loadData() {
    setLoading(true)
    
    // Load skills with memory count
    const { data: skillsData } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order')
    
    // Load memories
    let memoriesQuery = supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (selectedSkill === 'uncategorized') {
      memoriesQuery = memoriesQuery.is('skill_id', null)
    } else if (selectedSkill) {
      memoriesQuery = memoriesQuery.eq('skill_id', selectedSkill)
    }
    
    const { data: memoriesData } = await memoriesQuery

    // Count memories per skill
    const skillsWithCount = (skillsData || []).map(skill => ({
      ...skill,
      memory_count: (memoriesData || []).filter(m => m.skill_id === skill.id).length
    }))
    
    setSkills(skillsWithCount)
    setMemories(memoriesData || [])
    setLoading(false)
  }

  const uncategorizedCount = memories.filter(m => !m.skill_id).length
  const totalCount = memories.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-xl">xmemory</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/import"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90"
            >
              <Upload className="w-4 h-4" />
              导入
            </Link>
            <Link href="/settings" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-6">
            {/* Skills Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                📁 Skills
              </h3>
              <div className="space-y-1">
                {skills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      selectedSkill === skill.id 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{skill.icon}</span>
                      <span className="truncate">{skill.name}</span>
                    </span>
                    <span className="text-xs text-gray-500">{skill.memory_count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Quick Filters */}
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSkill(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  selectedSkill === null 
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>全部</span>
                </span>
                <span className="text-xs text-gray-500">{totalCount}</span>
              </button>
              <button
                onClick={() => setSelectedSkill('uncategorized')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  selectedSkill === 'uncategorized' 
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>未分类</span>
                </span>
                <span className="text-xs text-gray-500">{uncategorizedCount}</span>
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* New Skill Button */}
            <Link
              href="/skill/new"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>新建 Skill</span>
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Profiles Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                🎭 Profiles
              </h3>
              <Link
                href="/profile/new"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>新建 Profile</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold mb-2">还没有记忆</h2>
              <p className="text-gray-500 mb-6">导入你的 ChatGPT Memory 开始整理</p>
              <Link
                href="/import"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90"
              >
                <Upload className="w-5 h-5" />
                开始导入
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selectedSkill === null ? '全部记忆' : 
                   selectedSkill === 'uncategorized' ? '未分类' :
                   skills.find(s => s.id === selectedSkill)?.name || '记忆'}
                </h2>
                <span className="text-sm text-gray-500">{memories.length} 条记忆</span>
              </div>
              
              <div className="space-y-3">
                {memories.map(memory => (
                  <div 
                    key={memory.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition"
                  >
                    <p className="text-gray-800 dark:text-gray-200">{memory.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        {memory.source === 'chatgpt' ? '🤖 ChatGPT' : 
                         memory.source === 'claude' ? '🔮 Claude' : '✍️ 手动'}
                      </span>
                      {memory.tags && memory.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          {memory.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
