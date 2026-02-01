import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隐私政策 - xmemory',
  description: 'xmemory 平台隐私保护政策',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">隐私政策</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p className="text-gray-500">最后更新：2026年2月1日</p>
        
        <h2>1. 信息收集</h2>
        <p>我们收集以下类型的信息：</p>
        <ul>
          <li><strong>账户信息：</strong>注册时提供的邮箱地址</li>
          <li><strong>交易记录：</strong>购买和销售历史</li>
          <li><strong>上传内容：</strong>您上传的 Memory 文件</li>
          <li><strong>使用数据：</strong>浏览记录、设备信息等</li>
        </ul>
        
        <h2>2. 信息使用</h2>
        <p>我们使用收集的信息用于：</p>
        <ul>
          <li>提供和改进平台服务</li>
          <li>处理交易和付款</li>
          <li>发送服务通知</li>
          <li>防止欺诈和滥用</li>
        </ul>
        
        <h2>3. 信息保护</h2>
        <p>我们采取以下措施保护您的信息：</p>
        <ul>
          <li>所有数据传输使用 SSL 加密</li>
          <li>文件存储采用加密处理</li>
          <li>定期安全审计和漏洞扫描</li>
          <li>严格的员工访问权限控制</li>
        </ul>
        
        <h2>4. 信息共享</h2>
        <p>我们不会出售您的个人信息。仅在以下情况下共享：</p>
        <ul>
          <li>经您明确同意</li>
          <li>法律要求或司法程序需要</li>
          <li>与服务提供商合作（如支付处理）</li>
        </ul>
        
        <h2>5. Cookie 使用</h2>
        <p>我们使用 Cookie 和类似技术来：</p>
        <ul>
          <li>保持登录状态</li>
          <li>记住您的偏好设置</li>
          <li>分析网站使用情况</li>
        </ul>
        
        <h2>6. 您的权利</h2>
        <p>您有权：</p>
        <ul>
          <li>访问和导出您的数据</li>
          <li>更正不准确的信息</li>
          <li>删除您的账户和数据</li>
          <li>撤回同意</li>
        </ul>
        
        <h2>7. 数据保留</h2>
        <p>我们在您使用服务期间保留数据。账户删除后，我们将在 30 天内删除您的个人数据，但可能保留交易记录以符合法律要求。</p>
        
        <h2>8. 联系我们</h2>
        <p>如有隐私相关问题，请联系：privacy@xmemory.work</p>
      </div>
    </div>
  )
}
