import { createClient } from '@/lib/supabase/server'
import { MemoryCard } from '@/components/memory/memory-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/types/database'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string
    q?: string
    platform?: string
  }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  let query = supabase
    .from('memories')
    .select('*, seller:profiles(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  if (params.category) {
    query = query.eq('category', params.category)
  }
  
  if (params.platform) {
    query = query.eq('platform', params.platform)
  }
  
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }
  
  const { data: memories } = await query.limit(50)
  
  const currentCategory = CATEGORIES.find(c => c.value === params.category)
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {currentCategory ? `${currentCategory.emoji} ${currentCategory.label}` : '浏览市场'}
        </h1>
        <p className="text-gray-500">
          发现专业调教的AI Memory
        </p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              name="q"
              placeholder="搜索Memory..."
              defaultValue={params.q}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </form>
        
        {/* Platform filter */}
        <div className="flex gap-2">
          <Link href={`/explore?${new URLSearchParams({ ...params, platform: '' })}`}>
            <Button variant={!params.platform ? 'default' : 'outline'} size="sm">
              全部
            </Button>
          </Link>
          <Link href={`/explore?${new URLSearchParams({ ...params, platform: 'chatgpt' })}`}>
            <Button variant={params.platform === 'chatgpt' ? 'default' : 'outline'} size="sm">
              ChatGPT
            </Button>
          </Link>
          <Link href={`/explore?${new URLSearchParams({ ...params, platform: 'claude' })}`}>
            <Button variant={params.platform === 'claude' ? 'default' : 'outline'} size="sm">
              Claude
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/explore">
          <Button variant={!params.category ? 'default' : 'outline'} size="sm">
            全部
          </Button>
        </Link>
        {CATEGORIES.map(category => (
          <Link
            key={category.value}
            href={`/explore?category=${category.value}`}
          >
            <Button
              variant={params.category === category.value ? 'default' : 'outline'}
              size="sm"
            >
              {category.emoji} {category.label}
            </Button>
          </Link>
        ))}
      </div>
      
      {/* Results */}
      {memories && memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memories.map(memory => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">暂无Memory</p>
          <Link href="/upload">
            <Button>成为第一个上传者</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
