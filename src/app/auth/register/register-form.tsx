'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterForm() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    
    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">注册成功！</h2>
          <p className="text-gray-500 mb-6">
            我们已向 {email} 发送了验证邮件，请点击邮件中的链接完成验证。
          </p>
          <Link href="/auth/login">
            <Button>返回登录</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">创建账户</CardTitle>
        <CardDescription>注册开始买卖AI Memory</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <Input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <Input
              type="password"
              required
              placeholder="至少6个字符"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">确认密码</label>
            <Input
              type="password"
              required
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          已有账户？{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            登录
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
