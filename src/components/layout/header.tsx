'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageSwitcher } from '@/components/language-switcher'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const { t } = useTranslation()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold">xmemory</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-gray-600 hover:text-gray-900">
              {t('nav.explore')}
            </Link>
            {user && (
              <Link href="/upload" className="text-gray-600 hover:text-gray-900">
                {t('nav.upload')}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">{t('nav.dashboard')}</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">{t('nav.login')}</Button>
              </Link>
              <Link href="/auth/register">
                <Button>{t('nav.register')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
