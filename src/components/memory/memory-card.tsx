import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatPrice, truncate } from '@/lib/utils'
import { CATEGORIES, type Memory } from '@/types/database'
import { Star, Download, BadgeCheck, ShoppingBag } from 'lucide-react'

interface MemoryCardProps {
  memory: Memory
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const category = CATEGORIES.find(c => c.value === memory.category)
  
  return (
    <Link href={`/memory/${memory.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{category?.emoji || '📦'}</span>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
              {memory.platform}
            </span>
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {memory.title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-3">
            {truncate(memory.description || '', 100)}
          </p>
          
          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {memory.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {memory.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{memory.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 border-t pt-4">
          {/* Seller info */}
          {memory.seller && (
            <div className="w-full flex items-center gap-2 text-sm text-gray-500">
              <span className="truncate">{memory.seller.display_name || '卖家'}</span>
              {memory.seller.is_verified && (
                <span title="已认证卖家">
                  <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                </span>
              )}
              {memory.seller.sales_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <ShoppingBag className="w-3 h-3" />
                  已售{memory.seller.sales_count}
                </span>
              )}
            </div>
          )}
          
          {/* Stats & Price */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {memory.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{memory.rating_avg?.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{memory.download_count}</span>
              </div>
            </div>
            
            <span className="font-bold text-lg">
              {memory.price === 0 ? '免费' : formatPrice(memory.price)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
