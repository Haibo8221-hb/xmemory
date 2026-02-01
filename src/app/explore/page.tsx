'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MemoryCard } from '@/components/memory/memory-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CATEGORIES, SUBCATEGORIES, type Memory } from '@/types/database'
import { Search, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'

// Category labels for i18n
const categoryLabels: Record<string, { en: string; zh: string }> = {
  development: { en: 'Development', zh: '编程开发' },
  writing: { en: 'Writing', zh: '写作创作' },
  business: { en: 'Business', zh: '商业办公' },
  education: { en: 'Education', zh: '教育学习' },
  lifestyle: { en: 'Lifestyle', zh: '生活方式' },
  creative: { en: 'Creative', zh: '创意设计' },
  other: { en: 'Other', zh: '其他' },
}

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()
  const supabase = createClient()
  
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''
  const platform = searchParams.get('platform') || ''
  const q = searchParams.get('q') || ''
  
  const currentCategory = CATEGORIES.find(c => c.value === category)
  const availableSubcategories = category ? SUBCATEGORIES[category] || [] : []
  
  useEffect(() => {
    async function fetchMemories() {
      setLoading(true)
      
      let query = supabase
        .from('memories')
        .select('*, seller:profiles(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (category) {
        query = query.eq('category', category)
      }
      
      if (subcategory) {
        query = query.eq('subcategory', subcategory)
      }
      
      if (platform) {
        query = query.eq('platform', platform)
      }
      
      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      }
      
      const { data } = await query.limit(50)
      setMemories(data || [])
      setLoading(false)
    }
    
    fetchMemories()
  }, [category, subcategory, platform, q, supabase])
  
  const texts = {
    en: {
      title: 'Explore Marketplace',
      subtitle: 'Discover professionally trained AI Memories',
      search: 'Search Memories...',
      searchBtn: 'Search',
      all: 'All',
      allCategory: 'All',
      noResults: 'No Memories found',
      beFirst: 'Be the first to upload',
      filters: 'Filters',
    },
    zh: {
      title: '浏览市场',
      subtitle: '发现专业调教的AI Memory',
      search: '搜索Memory...',
      searchBtn: '搜索',
      all: '全部',
      allCategory: '全部',
      noResults: '暂无Memory',
      beFirst: '成为第一个上传者',
      filters: '筛选',
    }
  }
  
  const txt = texts[locale]
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    window.location.href = `/explore?${params.toString()}`
  }
  
  const buildUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams()
    if (newParams.category) params.set('category', newParams.category)
    if (newParams.subcategory) params.set('subcategory', newParams.subcategory)
    if (newParams.platform) params.set('platform', newParams.platform)
    if (q) params.set('q', q)
    return `/explore?${params.toString()}`
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {currentCategory 
            ? `${currentCategory.emoji} ${categoryLabels[currentCategory.value]?.[locale] || currentCategory.label}` 
            : txt.title}
        </h1>
        <p className="text-gray-500">{txt.subtitle}</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={txt.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0">
            {txt.searchBtn}
          </Button>
        </form>
        
        {/* Platform filter */}
        <div className="flex gap-2">
          <Link href={buildUrl({ category, subcategory, platform: '' })}>
            <Button variant={!platform ? 'default' : 'outline'} size="sm" className={!platform ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-0' : ''}>
              {txt.all}
            </Button>
          </Link>
          <Link href={buildUrl({ category, subcategory, platform: 'chatgpt' })}>
            <Button variant={platform === 'chatgpt' ? 'default' : 'outline'} size="sm" className={platform === 'chatgpt' ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-0' : ''}>
              ChatGPT
            </Button>
          </Link>
          <Link href={buildUrl({ category, subcategory, platform: 'claude' })}>
            <Button variant={platform === 'claude' ? 'default' : 'outline'} size="sm" className={platform === 'claude' ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-0' : ''}>
              Claude
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/explore">
          <Button variant={!category ? 'default' : 'outline'} size="sm" className={!category ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-0' : ''}>
            {txt.all}
          </Button>
        </Link>
        {CATEGORIES.map(cat => (
          <Link
            key={cat.value}
            href={`/explore?category=${cat.value}`}
          >
            <Button
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              className={category === cat.value ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-0' : ''}
            >
              {cat.emoji} {categoryLabels[cat.value]?.[locale] || cat.label}
            </Button>
          </Link>
        ))}
      </div>
      
      {/* Subcategories */}
      {category && availableSubcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pl-4 border-l-2 border-purple-200">
          <Link href={`/explore?category=${category}`}>
            <Button variant={!subcategory ? 'default' : 'ghost'} size="sm" className={!subcategory ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}>
              {txt.allCategory} {categoryLabels[category]?.[locale] || currentCategory?.label}
            </Button>
          </Link>
          {availableSubcategories.map(sub => (
            <Link
              key={sub.value}
              href={`/explore?category=${category}&subcategory=${sub.value}`}
            >
              <Button
                variant={subcategory === sub.value ? 'default' : 'ghost'}
                size="sm"
                className={subcategory === sub.value ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}
              >
                {sub.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
      
      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memories.map(memory => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">{txt.noResults}</p>
          <Link href="/upload">
            <Button className="btn-hover bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0">
              {txt.beFirst}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
