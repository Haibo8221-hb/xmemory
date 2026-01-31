import Link from 'next/link'

export function Footer() {
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
              AI记忆交易市场<br />
              让调教成果变现
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">市场</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/explore" className="hover:text-gray-900">浏览全部</Link></li>
              <li><Link href="/explore?category=programming" className="hover:text-gray-900">编程开发</Link></li>
              <li><Link href="/explore?category=writing" className="hover:text-gray-900">写作创作</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">帮助</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/docs/export" className="hover:text-gray-900">如何导出Memory</Link></li>
              <li><Link href="/docs/import" className="hover:text-gray-900">如何导入Memory</Link></li>
              <li><Link href="/docs/faq" className="hover:text-gray-900">常见问题</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">法律</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-gray-900">用户协议</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900">隐私政策</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} xmemory. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
