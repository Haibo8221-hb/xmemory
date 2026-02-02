'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/lib/i18n/context'
import { 
  Plus, Check, Edit, Trash2, Download, Upload,
  Briefcase, Home, BookOpen, Ghost, Sparkles,
  ChevronRight, Save, X, Users
} from 'lucide-react'

interface Profile {
  id: string
  name: string
  icon: string
  description: string | null
  color: string
  is_active: boolean
  is_default: boolean
  memory_count: number
  created_at: string
}

interface Memory {
  id: string
  title: string
  platform: string
  category: string | null
}

const ICONS = ['🏢', '🏠', '📚', '👻', '💼', '🎮', '✈️', '💪', '🎨', '🔬']
const COLORS = ['purple', 'blue', 'green', 'orange', 'red', 'pink', 'indigo', 'teal']

export default function ProfilesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useTranslation()
  
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [assignedMemoryIds, setAssignedMemoryIds] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  
  const texts = {
    en: {
      title: 'Memory Profiles',
      subtitle: 'Switch between different AI personas',
      create: 'Create Profile',
      active: 'Active',
      activate: 'Activate',
      edit: 'Edit',
      delete: 'Delete',
      export: 'Export',
      memories: 'memories',
      
      // Profile editing
      editProfile: 'Edit Profile',
      createProfile: 'Create Profile',
      profileName: 'Profile Name',
      profileDesc: 'Description',
      selectIcon: 'Select Icon',
      selectColor: 'Select Color',
      save: 'Save',
      cancel: 'Cancel',
      
      // Memory assignment
      assignMemories: 'Assign Memories',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      saveAssignment: 'Save Assignment',
      
      // Export
      exportTitle: 'Export Profile',
      exportDesc: 'Copy this to your ChatGPT memory settings',
      copyJson: 'Copy JSON',
      copied: 'Copied!',
      
      // Defaults
      work: 'Work',
      workDesc: 'Professional context',
      personal: 'Personal',
      personalDesc: 'Personal life',
      learning: 'Learning',
      learningDesc: 'Study and learning',
      anonymous: 'Anonymous',
      anonymousDesc: 'Start fresh',
    },
    zh: {
      title: '记忆人格',
      subtitle: '在不同的 AI 人格之间切换',
      create: '创建人格',
      active: '已激活',
      activate: '激活',
      edit: '编辑',
      delete: '删除',
      export: '导出',
      memories: '条记忆',
      
      editProfile: '编辑人格',
      createProfile: '创建人格',
      profileName: '人格名称',
      profileDesc: '描述',
      selectIcon: '选择图标',
      selectColor: '选择颜色',
      save: '保存',
      cancel: '取消',
      
      assignMemories: '分配记忆',
      selectAll: '全选',
      deselectAll: '取消全选',
      saveAssignment: '保存分配',
      
      exportTitle: '导出人格',
      exportDesc: '复制到你的 ChatGPT Memory 设置',
      copyJson: '复制 JSON',
      copied: '已复制！',
      
      work: '工作',
      workDesc: '职业相关',
      personal: '个人',
      personalDesc: '个人生活',
      learning: '学习',
      learningDesc: '学习相关',
      anonymous: '匿名',
      anonymousDesc: '全新开始',
    }
  }
  
  const txt = texts[locale]
  
  useEffect(() => {
    checkAuthAndFetch()
  }, [])
  
  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/profiles')
      return
    }
    fetchData()
  }
  
  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/profiles')
      const data = await res.json()
      setProfiles(data.profiles || [])
      setMemories(data.memories || [])
      
      // Select active profile by default
      const active = (data.profiles || []).find((p: Profile) => p.is_active)
      if (active) {
        setSelectedProfile(active)
        loadProfileMemories(active.id)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function loadProfileMemories(profileId: string) {
    try {
      const res = await fetch(`/api/profiles/memories?profileId=${profileId}`)
      const data = await res.json()
      setAssignedMemoryIds((data.memories || []).map((m: Memory) => m.id))
    } catch (error) {
      console.error('Load memories error:', error)
    }
  }
  
  async function activateProfile(profileId: string) {
    try {
      await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profileId, action: 'set_active' })
      })
      fetchData()
    } catch (error) {
      console.error('Activate error:', error)
    }
  }
  
  async function deleteProfile(profileId: string) {
    if (!confirm('Are you sure you want to delete this profile?')) return
    
    try {
      await fetch(`/api/profiles?id=${profileId}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }
  
  async function saveMemoryAssignment() {
    if (!selectedProfile) return
    
    setSaving(true)
    try {
      await fetch('/api/profiles/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedProfile.id,
          memoryIds: assignedMemoryIds
        })
      })
      fetchData()
    } catch (error) {
      console.error('Save assignment error:', error)
    } finally {
      setSaving(false)
    }
  }
  
  function toggleMemory(memoryId: string) {
    setAssignedMemoryIds(prev => 
      prev.includes(memoryId)
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    )
  }
  
  function selectProfile(profile: Profile) {
    setSelectedProfile(profile)
    loadProfileMemories(profile.id)
  }
  
  function getColorClass(color: string) {
    const colors: Record<string, string> = {
      purple: 'from-purple-500 to-purple-600',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
      teal: 'from-teal-500 to-teal-600',
    }
    return colors[color] || colors.purple
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
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
            <Users className="w-8 h-8" />
            {txt.title}
          </h1>
          <p className="text-gray-500 mt-1">{txt.subtitle}</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {txt.create}
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profiles List */}
        <div className="md:col-span-1 space-y-4">
          {profiles.map(profile => (
            <Card 
              key={profile.id}
              className={`cursor-pointer transition-all ${
                selectedProfile?.id === profile.id 
                  ? 'ring-2 ring-purple-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => selectProfile(profile)}
            >
              <div className={`h-1 bg-gradient-to-r ${getColorClass(profile.color)}`} />
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClass(profile.color)} flex items-center justify-center text-2xl`}>
                      {profile.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{profile.name}</h3>
                        {profile.is_active && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            {txt.active}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {profile.memory_count} {txt.memories}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedProfile?.id === profile.id ? 'rotate-90' : ''
                  }`} />
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {!profile.is_active && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        activateProfile(profile.id)
                      }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {txt.activate}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEditModal(profile)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!profile.is_default && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProfile(profile.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Memory Assignment */}
        <div className="md:col-span-2">
          {selectedProfile ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedProfile.icon}</span>
                    {txt.assignMemories}: {selectedProfile.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setAssignedMemoryIds(memories.map(m => m.id))}
                    >
                      {txt.selectAll}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setAssignedMemoryIds([])}
                    >
                      {txt.deselectAll}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {memories.map(memory => (
                    <div 
                      key={memory.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        assignedMemoryIds.includes(memory.id)
                          ? 'bg-purple-50 border border-purple-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleMemory(memory.id)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        assignedMemoryIds.includes(memory.id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {assignedMemoryIds.includes(memory.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{memory.title}</p>
                        <p className="text-xs text-gray-500">
                          {memory.platform} {memory.category && `• ${memory.category}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {memories.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No memories yet. Add some in Memory Bank first.
                    </p>
                  )}
                </div>
                
                {/* Save Button */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    onClick={saveMemoryAssignment}
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-600 to-pink-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : txt.saveAssignment}
                    <span className="ml-2 text-xs opacity-75">
                      ({assignedMemoryIds.length})
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a profile to manage memories</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <ProfileModal
          profile={showEditModal}
          onClose={() => {
            setShowCreateModal(false)
            setShowEditModal(null)
          }}
          onSave={() => {
            setShowCreateModal(false)
            setShowEditModal(null)
            fetchData()
          }}
          txt={txt}
        />
      )}
    </div>
  )
}

// Profile Modal Component
function ProfileModal({
  profile,
  onClose,
  onSave,
  txt
}: {
  profile: Profile | null
  onClose: () => void
  onSave: () => void
  txt: Record<string, string>
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: profile?.name || '',
    description: profile?.description || '',
    icon: profile?.icon || '🎭',
    color: profile?.color || 'purple',
  })
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const method = profile ? 'PATCH' : 'POST'
      const body = profile ? { ...form, id: profile.id } : form
      
      await fetch('/api/profiles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      onSave()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {profile ? txt.editProfile : txt.createProfile}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{txt.profileName}</label>
            <Input
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Work Mode"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{txt.profileDesc}</label>
            <Input
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{txt.selectIcon}</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    form.icon === icon 
                      ? 'bg-purple-100 ring-2 ring-purple-500' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setForm(prev => ({ ...prev, icon }))}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{txt.selectColor}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                    color === 'purple' ? 'from-purple-500 to-purple-600' :
                    color === 'blue' ? 'from-blue-500 to-blue-600' :
                    color === 'green' ? 'from-green-500 to-green-600' :
                    color === 'orange' ? 'from-orange-500 to-orange-600' :
                    color === 'red' ? 'from-red-500 to-red-600' :
                    color === 'pink' ? 'from-pink-500 to-pink-600' :
                    color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
                    'from-teal-500 to-teal-600'
                  } ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {txt.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-500"
            >
              {loading ? 'Saving...' : txt.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
