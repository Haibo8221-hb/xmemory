'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale, TranslationKey } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Check localStorage first
    const saved = localStorage.getItem('locale') as Locale
    if (saved && translations[saved]) {
      setLocaleState(saved)
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('zh')) {
        setLocaleState('zh')
      } else {
        setLocaleState('en')
      }
    }
    setMounted(true)
  }, [])
  
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }
  
  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations['en'][key] || key
  }
  
  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }
  
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function useTranslation() {
  return useI18n()
}
