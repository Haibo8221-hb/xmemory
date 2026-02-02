import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 E2E 测试清理...\n')
  
  // 1. 清理测试生成的文件
  const testFilesDir = 'tests/e2e/fixtures/test-files'
  if (fs.existsSync(testFilesDir)) {
    const files = fs.readdirSync(testFilesDir)
    let cleaned = 0
    for (const file of files) {
      if (file.includes('e2e')) {
        fs.unlinkSync(path.join(testFilesDir, file))
        cleaned++
      }
    }
    if (cleaned > 0) {
      console.log(`  ✓ 清理了 ${cleaned} 个测试文件`)
    }
  }
  
  // 2. 可选：清理测试数据库记录
  // 如果使用 service role key，可以在这里清理测试数据
  // const supabase = getSupabaseClient()
  // await supabase.from('cloud_memories').delete().like('account_label', 'e2e-test-%')
  
  console.log('\n✅ 清理完成\n')
}

export default globalTeardown
