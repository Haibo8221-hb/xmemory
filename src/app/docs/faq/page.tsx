import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '常见问题 - xmemory',
  description: 'xmemory 平台常见问题解答',
}

export default function FAQPage() {
  const faqs = [
    {
      q: '什么是 AI Memory？',
      a: 'AI Memory 是 ChatGPT 等 AI 助手用来记住你的偏好、专业知识和对话习惯的功能。通过导入精心调教的 Memory，你可以快速获得一个专业化的 AI 助手。'
    },
    {
      q: '购买后如何使用？',
      a: '购买后在「我买的」页面下载 Memory 文件，然后按照导入指南将内容告诉你的 ChatGPT，它会自动记住这些信息。'
    },
    {
      q: '可以退款吗？',
      a: '由于数字商品的特殊性，一旦下载后无法退款。请在购买前仔细阅读商品描述和预览内容。'
    },
    {
      q: '如何成为卖家？',
      a: '注册账户后即可上传你的 Memory 进行销售。我们会审核内容确保质量，审核通过后商品会出现在市场中。'
    },
    {
      q: '平台收取多少费用？',
      a: '平台收取 20% 的交易服务费，卖家获得 80% 的销售收入。'
    },
    {
      q: 'Memory 文件安全吗？',
      a: '我们不会查看或使用你的 Memory 内容。所有文件加密存储，只有购买者可以下载。'
    },
    {
      q: '支持哪些 AI 平台？',
      a: '目前主要支持 ChatGPT。我们计划未来支持 Claude、Gemini 等更多 AI 助手。'
    },
    {
      q: '如何联系客服？',
      a: '有任何问题请发送邮件至 support@xmemory.work，我们会在 24 小时内回复。'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">常见问题</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-start gap-2">
              <span className="text-blue-500">Q:</span>
              {faq.q}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 pl-6">
              <span className="text-green-500 font-semibold">A:</span> {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
