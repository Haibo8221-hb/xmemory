import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '用户协议 - xmemory',
  description: 'xmemory 平台用户服务协议',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">用户协议</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p className="text-gray-500">最后更新：2026年2月1日</p>
        
        <h2>1. 服务说明</h2>
        <p>xmemory 是一个 AI Memory 交易平台，用户可以在此购买和销售 ChatGPT 等 AI 助手的记忆文件。</p>
        
        <h2>2. 账户注册</h2>
        <p>使用本平台服务需要注册账户。您应提供真实、准确的信息，并妥善保管账户密码。</p>
        
        <h2>3. 买家责任</h2>
        <ul>
          <li>购买前请仔细阅读商品描述</li>
          <li>数字商品一经下载不支持退款</li>
          <li>禁止将购买内容二次转售</li>
        </ul>
        
        <h2>4. 卖家责任</h2>
        <ul>
          <li>确保上传内容为原创或有合法授权</li>
          <li>不得上传违法、侵权或有害内容</li>
          <li>如实描述商品内容和功能</li>
        </ul>
        
        <h2>5. 禁止内容</h2>
        <p>以下内容严禁上传和交易：</p>
        <ul>
          <li>违法违规内容</li>
          <li>侵犯他人知识产权的内容</li>
          <li>含有个人隐私信息的内容</li>
          <li>恶意软件或有害代码</li>
          <li>色情、暴力或仇恨内容</li>
        </ul>
        
        <h2>6. 费用与结算</h2>
        <p>平台收取 20% 的交易服务费。卖家收入将在确认无争议后结算至绑定账户。</p>
        
        <h2>7. 免责声明</h2>
        <p>平台不对用户上传内容的准确性、合法性负责。使用 Memory 文件的风险由用户自行承担。</p>
        
        <h2>8. 协议变更</h2>
        <p>我们保留修改本协议的权利。重大变更将通过邮件或站内通知告知用户。</p>
        
        <h2>9. 联系我们</h2>
        <p>如有疑问，请联系：support@xmemory.work</p>
      </div>
    </div>
  )
}
