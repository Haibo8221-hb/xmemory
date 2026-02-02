import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { I18nProvider } from '@/lib/i18n/context'

export const metadata: Metadata = {
  title: 'xmemory - AI Memory 管理工具',
  description: '导入、整理、同步你的 AI 记忆，跨平台无缝切换',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <I18nProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
