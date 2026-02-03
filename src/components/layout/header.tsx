'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Search, User as UserIcon, ChevronDown, Brain, Upload, ShoppingBag, Package, Settings, LogOut, Eye, Users, Sparkles } from 'lucide-react'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { t, locale } = useTranslation()

  const texts = {
    en: {
      memoryBank: 'My Library',
      explore: 'Explore',
      upload: 'Upload',
      dashboard: 'Dashboard',
      myPurchases: 'My Purchases',
      mySales: 'My Sales',
      settings: 'Settings',
      logout: 'Log out',
      login: 'Login',
      register: 'Get Started',
      search: 'Search',
    },
    zh: {
      memoryBank: '内容库',
      explore: '浏览市场',
      upload: '上传',
      dashboard: '控制台',
      myPurchases: '我买的',
      mySales: '我卖的',
      settings: '设置',
      logout: '退出登录',
      login: '登录',
      register: '免费开始',
      search: '搜索',
    }
  }
  
  const txt = texts[locale] || texts.en

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowDropdown(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🧠</span>
            <span className="text-xl font-bold text-gradient">xmemory</span>
          </Link>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`${txt.search} Memory...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-100/80 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white transition-all"
              />
            </div>
          </form>
          
          {/* Main Nav - Updated */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Memory Bank - Primary CTA for logged in users */}
            {user && (
              <Link href="/dashboard/memory-bank">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium">
                  <Brain className="w-4 h-4 mr-1.5" />
                  {txt.memoryBank}
                </Button>
              </Link>
            )}
            <Link href="/explore" className="px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors text-sm">
              {txt.explore}
            </Link>
            <Link href="/upload" className="px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors text-sm">
              {txt.upload}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showDropdown && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {/* Memory Bank - Top item */}
                    <Link 
                      href="/dashboard/memory-bank" 
                      className="flex items-center gap-3 px-4 py-2.5 text-purple-600 hover:bg-purple-50 font-medium"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Brain className="w-4 h-4" />
                      🧠 {txt.memoryBank}
                    </Link>
                    
                    {/* X-Ray - New Feature */}
                    <Link 
                      href="/dashboard/xray" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                      {locale === 'zh' ? '记忆透视' : 'Memory X-Ray'}
                    </Link>
                    
                    {/* Profiles - New Feature */}
                    <Link 
                      href="/dashboard/profiles" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Users className="w-4 h-4 text-green-500" />
                      {locale === 'zh' ? '记忆人格' : 'Memory Profiles'}
                    </Link>
                    
                    {/* Smart Organize - New Feature */}
                    <Link 
                      href="/dashboard/organize" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      {locale === 'zh' ? '智能整理' : 'Smart Organize'}
                    </Link>
                    
                    <hr className="my-2 border-gray-100" />
                    
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      {txt.dashboard}
                    </Link>
                    <Link 
                      href="/dashboard/purchases" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      {txt.myPurchases}
                    </Link>
                    <Link 
                      href="/dashboard/sales" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Upload className="w-4 h-4 text-gray-400" />
                      {txt.mySales}
                    </Link>
                    
                    <hr className="my-2 border-gray-100" />
                    
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {txt.logout}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="btn-hover">{txt.login}</Button>
              </Link>
              <Link href="/dashboard/memory-bank">
                <Button className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0">
                  {txt.register}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
