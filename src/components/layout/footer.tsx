'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

export function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧠</span>
              <span className="text-lg font-bold">xmemory</span>
            </div>
            <p className="text-sm text-gray-500">
              {t('home.title')}<br />
              {t('home.subtitle')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.marketplace')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/explore" className="hover:text-gray-900">{t('footer.browseAll')}</Link></li>
              <li><Link href="/explore?category=development" className="hover:text-gray-900">{t('category.development')}</Link></li>
              <li><Link href="/explore?category=writing" className="hover:text-gray-900">{t('category.writing')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.help')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/docs/export" className="hover:text-gray-900">{t('footer.howToExport')}</Link></li>
              <li><Link href="/docs/import" className="hover:text-gray-900">{t('footer.howToImport')}</Link></li>
              <li><Link href="/docs/faq" className="hover:text-gray-900">{t('footer.faq')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-gray-900">{t('upload.terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900">{t('upload.privacy')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
