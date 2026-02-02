'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, GripVertical, Plus, Pencil, X } from 'lucide-react'

interface Memory {
  id: string
  content: string
  source: string
  skill_id: string | null
}

interface Skill {
  id: string
  name: string
  description: string | null
  icon: string
}

const EMOJI_OPTIONS = ['📁', '🐍', '✍️', '📧', '💬', '💡', '🎨', '📚', '🔧', '🎯', '🚀', '💻', '🎓', '🏠', '🎮']

export default function SkillEditPage() {
  const params = useParams()
  const isNew = params.id === 'new'
  const skillId = isNew ? null : params.id as string
  
  const [skill, setSkill] = useState<Skill>({
    id: '',
    name: '',
    description: '',
    icon: '📁'
  })
  const [memories, setMemories] = useState<Memory[]>([])
  const [availableMemories, setAvailableMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [editingMemory, setEditingMemory] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!isNew) {
      loadSkill()
    }
    loadAvailableMemories()
  }, [skillId])

  async function loadSkill() {
    setLoading(true)
    
    const { data: skillData } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single()
    
    if (skillData) {
      setSkill(skillData)
    }
    
    const { data: memoriesData } = await supabase
      .from('memories')
      .select('*')
      .eq('skill_id', skillId)
      .order('created_at')
    
    setMemories(memoriesData || [])
    setLoading(false)
  }

  async function loadAvailableMemories() {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .is('skill_id', null)
      .order('created_at', { ascending: false })
    
    setAvailableMemories(data || [])
  }

  async function handleSave() {
    if (!skill.name.trim()) {
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
        .from('skills')
        .insert({
          user_id: user.id,
          name: skill.name,
          description: skill.description,
          icon: skill.icon
        })
        .select()
        .single()
      
      if (error) {
        alert('创建失败：' + error.message)
        setSaving(false)
        return
      }
      
      router.push(`/skill/${data.id}`)
    } else {
      const { error } = await supabase
        .from('skills')
        .update({
          name: skill.name,
          description: skill.description,
          icon: skill.icon
        })
        .eq('id', skillId)
      
      if (error) {
        alert('保存失败：' + error.message)
      }
    }
    
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('确定要删除这个 Skill 吗？其中的记忆不会被删除，只会变为未分类。')) {
      return
    }
    
    // First, unassign all memories
    await supabase
      .from('memories')
      .update({ skill_id: null })
      .eq('skill_id', skillId)
    
    // Then delete the skill
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId)
    
    if (error) {
      alert('删除失败：' + error.message)
      return
    }
    
    router.push('/bank')
  }

  async function addMemoryToSkill(memoryId: string) {
    const { error } = await supabase
      .from('memories')
      .update({ skill_id: skillId })
      .eq('id', memoryId)
    
    if (!error) {
      const memory = availableMemories.find(m => m.id === memoryId)
      if (memory) {
        setMemories(prev => [...prev, { ...memory, skill_id: skillId! }])
        setAvailableMemories(prev => prev.filter(m => m.id !== memoryId))
      }
    }
    
    setShowAddMemory(false)
  }

  async function removeMemoryFromSkill(memoryId: string) {
    const { error } = await supabase
      .from('memories')
      .update({ skill_id: null })
      .eq('id', memoryId)
    
    if (!error) {
      const memory = memories.find(m => m.id === memoryId)
      if (memory) {
        setAvailableMemories(prev => [{ ...memory, skill_id: null }, ...prev])
        setMemories(prev => prev.filter(m => m.id !== memoryId))
      }
    }
  }

  async function updateMemoryContent(memoryId: string) {
    const { error } = await supabase
      .from('memories')
      .update({ content: editingContent })
      .eq('id', memoryId)
    
    if (!error) {
      setMemories(prev => prev.map(m => 
        m.id === memoryId ? { ...m, content: editingContent } : m
      ))
    }
    
    setEditingMemory(null)
    setEditingContent('')
  }

  async function deleteMemory(memoryId: string) {
    if (!confirm('确定要永久删除这条记忆吗？')) {
      return
    }
    
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)
    
    if (!error) {
      setMemories(prev => prev.filter(m => m.id !== memoryId))
    }
  }

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
              {isNew ? '✨ 新建 Skill' : '✏️ 编辑 Skill'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
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
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 text-3xl bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
              >
                {skill.icon}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 grid grid-cols-5 gap-1">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setSkill(s => ({ ...s, icon: emoji }))
                        setShowEmojiPicker(false)
                      }}
                      className="w-10 h-10 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={skill.name}
                onChange={e => setSkill(s => ({ ...s, name: e.target.value }))}
                placeholder="Skill 名称"
                className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
              />
            </div>
          </div>
          
          <textarea
            value={skill.description || ''}
            onChange={e => setSkill(s => ({ ...s, description: e.target.value }))}
            placeholder="描述（可选）"
            rows={2}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Memories */}
        {!isNew && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">📝 记忆条目 ({memories.length})</h2>
              <button
                onClick={() => setShowAddMemory(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
            
            {memories.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                还没有记忆，点击"添加"从未分类记忆中选择
              </p>
            ) : (
              <div className="space-y-2">
                {memories.map(memory => (
                  <div
                    key={memory.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      {editingMemory === memory.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded"
                            autoFocus
                          />
                          <button
                            onClick={() => updateMemoryContent(memory.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMemory(null)
                              setEditingContent('')
                            }}
                            className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-800 dark:text-gray-200">{memory.content}</p>
                      )}
                    </div>
                    {editingMemory !== memory.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingMemory(memory.id)
                            setEditingContent(memory.content)
                          }}
                          className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeMemoryFromSkill(memory.id)}
                          className="p-1 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded"
                          title="移出 Skill"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMemory(memory.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          title="永久删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-4">
              💡 拖拽调整顺序，靠前的记忆优先级更高
            </p>
          </div>
        )}

        {/* Add Memory Modal */}
        {showAddMemory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold">从未分类中添加</h3>
                <button
                  onClick={() => setShowAddMemory(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {availableMemories.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">没有未分类的记忆</p>
                ) : (
                  <div className="space-y-2">
                    {availableMemories.map(memory => (
                      <button
                        key={memory.id}
                        onClick={() => addMemoryToSkill(memory.id)}
                        className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      >
                        <p className="text-gray-800 dark:text-gray-200">{memory.content}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
