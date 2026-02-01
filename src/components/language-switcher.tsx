'use client'

import { useI18n } from '@/lib/i18n/context'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  
  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh' : 'en')
  }
  
  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title={locale === 'en' ? '切换到中文' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'en' ? '中文' : 'EN'}</span>
    </button>
  )
}
