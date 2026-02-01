import { Metadata } from 'next'
import { Suspense } from 'react'
import RegisterForm from './register-form'

export const metadata: Metadata = {
  title: '注册 - xmemory',
  description: '注册xmemory账户，开始购买和出售专业调教的AI Memory',
  openGraph: {
    title: '注册 - xmemory',
    description: '注册xmemory账户，开始购买和出售专业调教的AI Memory',
  },
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
