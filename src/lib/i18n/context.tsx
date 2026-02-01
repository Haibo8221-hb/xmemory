'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale, TranslationKey } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

// Default context value for SSR
const defaultContext: I18nContextType = {
  locale: 'en',
  setLocale: () => {},
  t: (key: TranslationKey): string => {
    return translations['en'][key] || key
  }
}

const I18nContext = createContext<I18nContextType>(defaultContext)

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
  
  // Always provide context, even during SSR
  const value: I18nContextType = mounted 
    ? { locale, setLocale, t }
    : defaultContext
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

export function useTranslation() {
  return useI18n()
}
