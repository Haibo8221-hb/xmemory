import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PurchaseButton } from '@/components/memory/purchase-button'
import { formatPrice, formatDate } from '@/lib/utils'
import { CATEGORIES } from '@/types/database'
import { Star, Download, Calendar, User, BadgeCheck, ShoppingBag } from 'lucide-react'

interface MemoryPageProps {
  params: Promise<{ id: string }>
}

export default async function MemoryPage({ params }: MemoryPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: memory } = await supabase
    .from('memories')
    .select('*, seller:profiles(*)')
    .eq('id', id)
    .single()
  
  if (!memory) {
    notFound()
  }
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, buyer:profiles(*)')
    .eq('memory_id', id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  const category = CATEGORIES.find(c => c.value === memory.category)
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                {memory.platform}
              </span>
              {category && (
                <span>{category.emoji} {category.label}</span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{memory.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {memory.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{memory.rating_avg?.toFixed(1)}</span>
                  <span>({memory.rating_count} 评价)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{memory.download_count} 下载</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(memory.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{memory.description}</p>
            </CardContent>
          </Card>
          
          {/* Preview */}
          {memory.preview_content && (
            <Card>
              <CardHeader>
                <CardTitle>预览内容</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  {memory.preview_content}
                </pre>
              </CardContent>
            </Card>
          )}
          
          {/* Tags */}
          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>用户评价</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.buyer?.display_name || '匿名用户'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                      {review.seller_reply && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">卖家回复:</p>
                          <p className="text-gray-700">{review.seller_reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">暂无评价</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase card */}
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold mb-4">
                {memory.price === 0 ? '免费' : formatPrice(memory.price)}
              </div>
              
              <div className="mb-4">
                <PurchaseButton 
                  memoryId={memory.id}
                  price={memory.price}
                  isFree={memory.price === 0}
                />
              </div>
              
              <p className="text-xs text-gray-500 text-center mb-6">
                购买后立即获得下载链接
              </p>
              
              {/* Seller info */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {memory.seller?.display_name || '匿名卖家'}
                      </p>
                      {memory.seller?.is_verified && (
                        <span title="已认证卖家">
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>卖家</span>
                      {memory.seller && memory.seller.sales_count > 0 && (
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          已售 {memory.seller.sales_count} 份
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {memory.seller?.bio && (
                  <p className="text-sm text-gray-500">{memory.seller.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* How to use */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">如何使用</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-500 space-y-2">
              <p>1. 购买后下载Memory文件</p>
              <p>2. 打开ChatGPT设置 → Memory</p>
              <p>3. 导入下载的文件</p>
              <p>4. 享受专业化的AI助手</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
