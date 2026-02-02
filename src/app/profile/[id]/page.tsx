'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Download, Copy, Check, FileJson } from 'lucide-react'

interface Skill {
  id: string
  name: string
  description: string | null
  icon: string
  memory_count?: number
}

interface Profile {
  id: string
  name: string
  description: string | null
  skill_ids: string[]
  target_platform: string
}

interface Memory {
  id: string
  content: string
  skill_id: string
}

export default function ProfileEditPage() {
  const params = useParams()
  const isNew = params.id === 'new'
  const profileId = isNew ? null : params.id as string
  
  const [profile, setProfile] = useState<Profile>({
    id: '',
    name: '',
    description: '',
    skill_ids: [],
    target_platform: 'chatgpt'
  })
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [exportText, setExportText] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSkills()
    if (!isNew) {
      loadProfile()
    }
  }, [profileId])

  async function loadSkills() {
    const { data: skillsData } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order')
    
    // Get memory counts
    const { data: memoriesData } = await supabase
      .from('memories')
      .select('skill_id')
    
    const skillsWithCount = (skillsData || []).map(skill => ({
      ...skill,
      memory_count: (memoriesData || []).filter(m => m.skill_id === skill.id).length
    }))
    
    setSkills(skillsWithCount)
  }

  async function loadProfile() {
    setLoading(true)
    
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    
    if (data) {
      setProfile(data)
    }
    
    setLoading(false)
  }

  function toggleSkill(skillId: string) {
    setProfile(p => ({
      ...p,
      skill_ids: p.skill_ids.includes(skillId)
        ? p.skill_ids.filter(id => id !== skillId)
        : [...p.skill_ids, skillId]
    }))
  }

  async function handleSave() {
    if (!profile.name.trim()) {
      alert('请输入名称')
      return
    }
    
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (isNew) {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          name: profile.name,
          description: profile.description,
          skill_ids: profile.skill_ids,
          target_platform: profile.target_platform
        })
        .select()
        .single()
      
      if (error) {
        alert('创建失败：' + error.message)
        setSaving(false)
        return
      }
      
      router.push(`/profile/${data.id}`)
    } else {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profile.name,
          description: profile.description,
          skill_ids: profile.skill_ids,
          target_platform: profile.target_platform
        })
        .eq('id', profileId)
      
      if (error) {
        alert('保存失败：' + error.message)
      }
    }
    
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('确定要删除这个 Profile 吗？')) {
      return
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', profileId)
    
    if (error) {
      alert('删除失败：' + error.message)
      return
    }
    
    router.push('/bank')
  }

  async function generateExport() {
    // Get all memories for selected skills
    const { data: memories } = await supabase
      .from('memories')
      .select('*, skills(name, icon)')
      .in('skill_id', profile.skill_ids)
      .order('skill_id')
    
    if (!memories || memories.length === 0) {
      alert('选中的 Skills 中没有记忆')
      return
    }
    
    // Group by skill
    const grouped: Record<string, { name: string, icon: string, memories: string[] }> = {}
    
    memories.forEach((m: any) => {
      const skillId = m.skill_id
      if (!grouped[skillId]) {
        grouped[skillId] = {
          name: m.skills?.name || '未知',
          icon: m.skills?.icon || '📁',
          memories: []
        }
      }
      grouped[skillId].memories.push(m.content)
    })
    
    // Generate text
    let text = '请记住以下关于我的信息：\n\n'
    
    Object.values(grouped).forEach(skill => {
      text += `## ${skill.icon} ${skill.name}\n`
      skill.memories.forEach(content => {
        text += `- ${content}\n`
      })
      text += '\n'
    })
    
    setExportText(text)
    setShowExport(true)
    
    // Record export
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('export_history').insert({
        user_id: user.id,
        profile_id: profileId,
        format: 'text',
        memory_count: memories.length
      })
      
      await supabase
        .from('user_profiles')
        .update({ last_exported_at: new Date().toISOString() })
        .eq('id', profileId)
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(exportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadJson() {
    const { data: memories } = await supabase
      .from('memories')
      .select('content, source')
      .in('skill_id', profile.skill_ids)
    
    const json = JSON.stringify({ memories }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${profile.name.replace(/\s+/g, '_')}_memories.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedSkills = skills.filter(s => profile.skill_ids.includes(s.id))
  const totalMemories = selectedSkills.reduce((sum, s) => sum + (s.memory_count || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/bank" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">
              {isNew ? '🎭 新建 Profile' : '🎭 编辑 Profile'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                <button
                  onClick={generateExport}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">名称</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="例如：工作模式"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">描述（可选）</label>
            <input
              type="text"
              value={profile.description || ''}
              onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
              placeholder="例如：日常开发和工作沟通"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">目标平台</label>
            <div className="flex gap-4">
              {[
                { value: 'chatgpt', label: '🤖 ChatGPT' },
                { value: 'claude', label: '🔮 Claude' },
                { value: 'universal', label: '🌐 通用' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    value={opt.value}
                    checked={profile.target_platform === opt.value}
                    onChange={e => setProfile(p => ({ ...p, target_platform: e.target.value }))}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Select Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">选择要包含的 Skills</h2>
          
          {skills.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              还没有创建 Skill，<Link href="/skill/new" className="text-purple-600 hover:underline">去创建一个</Link>
            </p>
          ) : (
            <div className="space-y-2">
              {skills.map(skill => (
                <label
                  key={skill.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                    profile.skill_ids.includes(skill.id)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.skill_ids.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-xl">{skill.icon}</span>
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      {skill.description && (
                        <p className="text-sm text-gray-500">{skill.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{skill.memory_count} 条</span>
                </label>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              📊 已选择 {selectedSkills.length} 个 Skills，共 {totalMemories} 条记忆
            </p>
          </div>
        </div>
      </main>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">📤 导出: {profile.name}</h3>
              <button
                onClick={() => setShowExport(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-500">
                复制以下内容，发送给你的 AI：
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">{exportText}</pre>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? '已复制！' : '复制到剪贴板'}
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FileJson className="w-5 h-5" />
                  下载 JSON
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                ✅ 复制后，去 ChatGPT 粘贴让它记住吧！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
