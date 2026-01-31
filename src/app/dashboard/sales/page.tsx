import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { CATEGORIES } from '@/types/database'
import { Plus, Download, Star, Edit } from 'lucide-react'

export default async function SalesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/dashboard/sales')
  }
  
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">我卖的</h1>
          <p className="text-gray-500">管理你上传的Memory</p>
        </div>
        <Link href="/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            上传新Memory
          </Button>
        </Link>
      </div>
      
      {memories && memories.length > 0 ? (
        <div className="space-y-4">
          {memories.map(memory => {
            const category = CATEGORIES.find(c => c.value === memory.category)
            return (
              <Card key={memory.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <span className="text-3xl">{category?.emoji || '📦'}</span>
                      <div>
                        <Link 
                          href={`/memory/${memory.id}`}
                          className="text-lg font-semibold hover:text-blue-600"
                        >
                          {memory.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                            {memory.platform}
                          </span>
                          <span className={
                            memory.status === 'active' 
                              ? 'text-green-600' 
                              : memory.status === 'draft'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }>
                            {memory.status === 'active' ? '已上架' : 
                             memory.status === 'draft' ? '草稿' : '已下架'}
                          </span>
                          <span>{formatDate(memory.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span>{memory.download_count} 下载</span>
                          </div>
                          {memory.rating_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{memory.rating_avg?.toFixed(1)} ({memory.rating_count})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {memory.price === 0 ? '免费' : formatPrice(memory.price)}
                      </p>
                      <Link href={`/dashboard/sales/${memory.id}/edit`}>
                        <Button variant="ghost" size="sm" className="mt-2">
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500 mb-4">你还没有上传任何Memory</p>
            <Link href="/upload">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                上传第一个Memory
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
