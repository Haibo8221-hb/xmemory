import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '如何导入Memory - xmemory',
  description: '了解如何将购买的Memory导入到ChatGPT',
}

export default function ImportGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">如何导入 Memory 到 ChatGPT</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <h2>步骤一：下载 Memory 文件</h2>
        <p>在「我买的」页面点击下载按钮，获取 Memory 的 JSON 文件。</p>
        
        <h2>步骤二：打开 ChatGPT Memory 设置</h2>
        <p>进入 ChatGPT → Settings → Personalization → Memory → Manage</p>
        
        <h2>步骤三：手动添加记忆</h2>
        <p>目前 ChatGPT 不支持直接导入 JSON 文件，你需要：</p>
        <ol>
          <li>打开下载的 JSON 文件</li>
          <li>阅读其中的记忆内容</li>
          <li>在与 ChatGPT 对话中告诉它这些信息</li>
          <li>让 ChatGPT 自然地记住这些内容</li>
        </ol>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-8">
          <h3 className="text-lg font-semibold mb-2">🚀 快速导入技巧</h3>
          <p>直接复制 Memory 内容发给 ChatGPT，并说：</p>
          <blockquote className="italic">
            「请记住以下关于我的信息：[粘贴内容]」
          </blockquote>
          <p>ChatGPT 会自动将这些信息添加到记忆中。</p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
          <h3 className="text-lg font-semibold mb-2">⚠️ 注意事项</h3>
          <ul>
            <li>导入后的记忆会与你现有记忆合并</li>
            <li>可以随时在 Memory 设置中删除不需要的记忆</li>
            <li>导入的专业知识会立即生效</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
