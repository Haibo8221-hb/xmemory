'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatPrice, truncate } from '@/lib/utils'
import { CATEGORIES, type Memory } from '@/types/database'
import { Star, Download, BadgeCheck, User } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface MemoryCardProps {
  memory: Memory
}

// Generate a gradient based on category
const categoryGradients: Record<string, string> = {
  development: 'from-indigo-500 to-purple-500',
  writing: 'from-amber-500 to-orange-500',
  business: 'from-emerald-500 to-teal-500',
  education: 'from-blue-500 to-cyan-500',
  lifestyle: 'from-pink-500 to-rose-500',
  creative: 'from-violet-500 to-purple-500',
  other: 'from-gray-500 to-slate-500',
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const { t, locale } = useTranslation()
  const category = CATEGORIES.find(c => c.value === memory.category)
  const gradient = categoryGradients[memory.category || 'other'] || 'from-gray-500 to-slate-500'
  
  return (
    <Link href={`/memory/${memory.id}`}>
      <Card className="h-full card-hover border-0 shadow-md overflow-hidden bg-white">
        {/* Cover gradient with emoji */}
        <div className={`h-24 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
          <span className="text-5xl opacity-90 drop-shadow-lg">
            {category?.emoji || '📦'}
          </span>
          {/* Platform badge */}
          <span className="absolute top-3 right-3 badge-platform bg-white/90 backdrop-blur-sm">
            {memory.platform}
          </span>
        </div>
        
        <CardContent className="pt-4 pb-2">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
            {memory.title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {truncate(memory.description || '', 80)}
          </p>
          
          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {memory.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {memory.tags.length > 3 && (
                <span className="text-xs text-gray-400 px-1">
                  +{memory.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 border-t border-gray-100 pt-3 pb-4">
          {/* Seller info */}
          <div className="w-full flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-600 truncate flex-1">
              {memory.seller?.display_name || (locale === 'en' ? 'Anonymous' : '匿名卖家')}
            </span>
            {memory.seller?.is_verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {/* Stats & Price */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              {memory.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-600">{memory.rating_avg?.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{memory.download_count}</span>
              </div>
            </div>
            
            {memory.price === 0 ? (
              <span className="badge-free">
                {locale === 'en' ? 'Free' : '免费'}
              </span>
            ) : (
              <span className="badge-price">
                {formatPrice(memory.price)}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
