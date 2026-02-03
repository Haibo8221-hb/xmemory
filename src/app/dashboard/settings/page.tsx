'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/lib/i18n/context'
import { Settings, Mail, User, Save, Check, Copy, AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useTranslation()
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    bio: '',
  })
  
  const texts = {
    en: {
      title: 'Settings',
      subtitle: 'Manage your account settings',
      
      // Profile section
      profileSection: 'Profile',
      profileDesc: 'Your public profile information',
      displayName: 'Display Name',
      displayNamePlaceholder: 'Your display name',
      bio: 'Bio',
      bioPlaceholder: 'Tell us about yourself',
      
      // Email upload section
      emailSection: 'Email Upload',
      emailDesc: 'Send content directly to xmemory via email',
      uploadEmail: 'Your Bound Email',
      uploadEmailPlaceholder: 'alice@example.com',
      uploadEmailHint: 'When you send emails from this address to upload@xmemory.work, content will automatically be saved to your account.',
      
      // Upload address
      uploadAddress: 'Upload Address',
      uploadAddressHint: 'Send emails with attachments or text content to this address',
      copyAddress: 'Copy',
      copied: 'Copied!',
      
      // User ID for subaddress
      userId: 'Your User ID',
      userIdHint: 'Alternative: send to upload+{id}@xmemory.work from any email',
      
      // Actions
      save: 'Save Changes',
      saving: 'Saving...',
      saved: 'Saved!',
      error: 'Error saving changes',
    },
    zh: {
      title: '设置',
      subtitle: '管理你的账户设置',
      
      profileSection: '个人资料',
      profileDesc: '你的公开资料信息',
      displayName: '显示名称',
      displayNamePlaceholder: '你的显示名称',
      bio: '简介',
      bioPlaceholder: '介绍一下你自己',
      
      emailSection: '邮件上传',
      emailDesc: '通过邮件直接发送内容到 xmemory',
      uploadEmail: '绑定的邮箱',
      uploadEmailPlaceholder: 'alice@example.com',
      uploadEmailHint: '从此邮箱发送邮件到 upload@xmemory.work，内容将自动保存到你的账户。',
      
      uploadAddress: '上传地址',
      uploadAddressHint: '发送带附件或文本内容的邮件到此地址',
      copyAddress: '复制',
      copied: '已复制！',
      
      userId: '你的用户 ID',
      userIdHint: '备选方案：从任意邮箱发送到 upload+{id}@xmemory.work',
      
      save: '保存更改',
      saving: '保存中...',
      saved: '已保存！',
      error: '保存失败',
    }
  }
  
  const txt = texts[locale]
  
  useEffect(() => {
    checkAuthAndFetch()
  }, [])
  
  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/dashboard/settings')
      return
    }
    setUser(user)
    fetchProfile(user.id)
  }
  
  async function fetchProfile(userId: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      setProfile(data)
      setForm({
        display_name: data.display_name || '',
        email: data.email || '',
        bio: data.bio || '',
      })
    } catch (error) {
      console.error('Fetch profile error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSave() {
    if (!user) return
    
    setSaving(true)
    setSaved(false)
    setError('')
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: form.display_name || null,
          email: form.email || null,
          bio: form.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || txt.error)
    } finally {
      setSaving(false)
    }
  }
  
  const [copied, setCopied] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  
  function copyToClipboard(text: string, type: 'address' | 'id') {
    navigator.clipboard.writeText(text)
    if (type === 'address') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
          <Settings className="w-8 h-8" />
          {txt.title}
        </h1>
        <p className="text-gray-500 mt-1">{txt.subtitle}</p>
      </div>
      
      {/* Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {txt.profileSection}
          </CardTitle>
          <CardDescription>{txt.profileDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{txt.displayName}</label>
            <Input
              value={form.display_name}
              onChange={(e) => setForm(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder={txt.displayNamePlaceholder}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{txt.bio}</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder={txt.bioPlaceholder}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Email Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {txt.emailSection}
          </CardTitle>
          <CardDescription>{txt.emailDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bound Email */}
          <div>
            <label className="block text-sm font-medium mb-1">{txt.uploadEmail}</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder={txt.uploadEmailPlaceholder}
            />
            <p className="text-sm text-gray-500 mt-1">{txt.uploadEmailHint}</p>
          </div>
          
          {/* Upload Address */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <label className="block text-sm font-medium mb-2">{txt.uploadAddress}</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm font-mono">
                upload@xmemory.work
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('upload@xmemory.work', 'address')}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1">{copied ? txt.copied : txt.copyAddress}</span>
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">{txt.uploadAddressHint}</p>
          </div>
          
          {/* User ID for subaddress */}
          {user && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium mb-2">{txt.userId}</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm font-mono truncate">
                  {user.id}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(user.id, 'id')}
                >
                  {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {txt.userIdHint.replace('{id}', user.id.slice(0, 8) + '...')}
              </p>
              <code className="block mt-2 text-xs text-purple-600 font-mono">
                upload+{user.id}@xmemory.work
              </code>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Save Button */}
      <div className="flex items-center justify-between">
        {error && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <div className="flex-1" />
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-pink-500"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {txt.saving}
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {txt.saved}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {txt.save}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
