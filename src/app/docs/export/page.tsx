import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '如何导出Memory - xmemory',
  description: '了解如何从ChatGPT导出你的Memory文件',
}

export default function ExportGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">如何导出 ChatGPT Memory</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <h2>步骤一：打开 ChatGPT 设置</h2>
        <p>点击左下角的头像，选择「Settings」（设置）。</p>
        
        <h2>步骤二：进入 Personalization</h2>
        <p>在设置页面中，点击「Personalization」（个性化）选项。</p>
        
        <h2>步骤三：管理 Memory</h2>
        <p>点击「Manage」按钮进入 Memory 管理页面。</p>
        
        <h2>步骤四：导出 Memory</h2>
        <p>点击右上角的「...」菜单，选择「Export memories」。</p>
        <p>ChatGPT 会生成一个 JSON 文件供你下载。</p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-8">
          <h3 className="text-lg font-semibold mb-2">💡 小贴士</h3>
          <ul>
            <li>导出的文件包含所有你与 ChatGPT 的对话记忆</li>
            <li>你可以选择性地编辑内容后再上传到 xmemory</li>
            <li>建议删除个人敏感信息后再分享</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
