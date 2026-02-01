'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PurchaseButton } from '@/components/memory/purchase-button'
import { formatPrice, formatDate } from '@/lib/utils'
import { CATEGORIES, type Memory } from '@/types/database'
import { Star, Download, Calendar, User, BadgeCheck, ShoppingBag } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface Review {
  id: string
  rating: number
  comment: string | null
  seller_reply: string | null
  created_at: string
  buyer?: {
    display_name: string | null
  }
}

interface MemoryDetailProps {
  memory: Memory
  reviews: Review[]
}

const categoryLabels: Record<string, { en: string; zh: string }> = {
  development: { en: 'Development', zh: '编程开发' },
  writing: { en: 'Writing', zh: '写作创作' },
  business: { en: 'Business', zh: '商业办公' },
  education: { en: 'Education', zh: '教育学习' },
  lifestyle: { en: 'Lifestyle', zh: '生活方式' },
  creative: { en: 'Creative', zh: '创意设计' },
  other: { en: 'Other', zh: '其他' },
}

export function MemoryDetail({ memory, reviews }: MemoryDetailProps) {
  const { locale } = useTranslation()
  
  const texts = {
    en: {
      description: 'Description',
      preview: 'Preview Content',
      reviews: 'Reviews',
      noReviews: 'No reviews yet',
      downloads: 'downloads',
      rating: 'rating',
      ratings: 'ratings',
      seller: 'Seller',
      sold: 'sold',
      anonymous: 'Anonymous',
      anonymousUser: 'Anonymous User',
      sellerReply: 'Seller reply:',
      howToUse: 'How to Use',
      step1: '1. Download Memory file after purchase',
      step2: '2. Open ChatGPT Settings → Memory',
      step3: '3. Import the downloaded file',
      step4: '4. Enjoy your specialized AI assistant',
      freeLabel: 'Free',
      instantDownload: 'Instant download after purchase',
      verified: 'Verified Seller',
    },
    zh: {
      description: '描述',
      preview: '预览内容',
      reviews: '用户评价',
      noReviews: '暂无评价',
      downloads: '下载',
      rating: '评分',
      ratings: '评价',
      seller: '卖家',
      sold: '已售',
      anonymous: '匿名卖家',
      anonymousUser: '匿名用户',
      sellerReply: '卖家回复:',
      howToUse: '如何使用',
      step1: '1. 购买后下载Memory文件',
      step2: '2. 打开ChatGPT设置 → Memory',
      step3: '3. 导入下载的文件',
      step4: '4. 享受专业化的AI助手',
      freeLabel: '免费',
      instantDownload: '购买后立即获得下载链接',
      verified: '已认证卖家',
    }
  }
  
  const txt = texts[locale]
  const category = CATEGORIES.find(c => c.value === memory.category)
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="badge-platform">
                {memory.platform}
              </span>
              {category && (
                <span className="flex items-center gap-1">
                  {category.emoji} {categoryLabels[category.value]?.[locale] || category.label}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{memory.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {memory.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{memory.rating_avg?.toFixed(1)}</span>
                  <span>({memory.rating_count} {txt.ratings})</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{memory.download_count} {txt.downloads}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(memory.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{txt.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{memory.description}</p>
            </CardContent>
          </Card>
          
          {/* Preview */}
          {memory.preview_content && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{txt.preview}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {memory.preview_content}
                </pre>
              </CardContent>
            </Card>
          )}
          
          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Reviews */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{txt.reviews}</CardTitle>
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
                          {review.buyer?.display_name || txt.anonymousUser}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                      {review.seller_reply && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-purple-200">
                          <p className="text-sm text-purple-600 mb-1">{txt.sellerReply}</p>
                          <p className="text-gray-700">{review.seller_reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{txt.noReviews}</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase card */}
          <Card className="sticky top-24 border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold mb-4">
                {memory.price === 0 ? (
                  <span className="text-gradient">{txt.freeLabel}</span>
                ) : (
                  <span className="text-gradient">{formatPrice(memory.price)}</span>
                )}
              </div>
              
              <div className="mb-4">
                <PurchaseButton 
                  memoryId={memory.id}
                  price={memory.price}
                  isFree={memory.price === 0}
                />
              </div>
              
              <p className="text-xs text-gray-500 text-center mb-6">
                {txt.instantDownload}
              </p>
              
              {/* Seller info */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {memory.seller?.display_name || txt.anonymous}
                      </p>
                      {memory.seller?.is_verified && (
                        <span title={txt.verified}>
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{txt.seller}</span>
                      {memory.seller && memory.seller.sales_count > 0 && (
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {txt.sold} {memory.seller.sales_count}
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
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">{txt.howToUse}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-500 space-y-2">
              <p>{txt.step1}</p>
              <p>{txt.step2}</p>
              <p>{txt.step3}</p>
              <p>{txt.step4}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
