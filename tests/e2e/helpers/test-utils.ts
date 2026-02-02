import { Page, expect, Download } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Supabase 测试客户端
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uupwzvbrcmiwkutgeqza.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key)
}

// 等待页面完全加载
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle')
  // 等待 hydration 完成
  await page.waitForTimeout(500)
}

// 检查是否有空状态
export async function hasEmptyState(page: Page): Promise<boolean> {
  const emptyPatterns = [
    'text=/no.*memor/i',
    'text=/还没有/i',
    'text=/暂无/i',
    'text=/empty/i',
  ]
  
  for (const pattern of emptyPatterns) {
    const element = page.locator(pattern).first()
    if (await element.isVisible().catch(() => false)) {
      return true
    }
  }
  return false
}

// 点击下载并验证
export async function clickDownloadAndVerify(
  page: Page,
  buttonSelector: string,
  expectedExtension: string = '.json'
): Promise<Download> {
  const downloadButton = page.locator(buttonSelector).first()
  await expect(downloadButton).toBeVisible({ timeout: 5000 })
  
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
  await downloadButton.click()
  
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(new RegExp(`${expectedExtension}$`, 'i'))
  
  return download
}

// 生成测试 Memory 文件内容
export function generateTestMemoryContent(platform: 'chatgpt' | 'claude' = 'chatgpt') {
  const timestamp = new Date().toISOString()
  const testId = `test-${Date.now()}`
  
  if (platform === 'chatgpt') {
    return JSON.stringify([
      { id: `${testId}-1`, key: 'E2E Test Memory 1', value: 'Test value for E2E testing', created_at: timestamp },
      { id: `${testId}-2`, key: 'E2E Test Memory 2', value: 'Another test value', created_at: timestamp },
    ], null, 2)
  }
  
  return JSON.stringify({
    memories: [
      { id: `${testId}-1`, key: 'E2E Claude Test', value: 'Claude test value' },
    ],
    metadata: { exported_at: timestamp }
  }, null, 2)
}

// 创建测试文件
export function createTestFile(filename: string, content: string): string {
  const testDataDir = path.join(__dirname, '../fixtures/test-files')
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true })
  }
  
  const filePath = path.join(testDataDir, filename)
  fs.writeFileSync(filePath, content)
  return filePath
}

// 清理测试文件
export function cleanupTestFiles() {
  const testDataDir = path.join(__dirname, '../fixtures/test-files')
  if (fs.existsSync(testDataDir)) {
    const files = fs.readdirSync(testDataDir)
    for (const file of files) {
      if (file.startsWith('e2e-test-')) {
        fs.unlinkSync(path.join(testDataDir, file))
      }
    }
  }
}

// 多语言按钮选择器
export const selectors = {
  download: 'button:has-text(/download|下载/i)',
  delete: 'button:has-text(/delete|删除/i)',
  upload: 'button:has-text(/upload|上传/i)',
  submit: 'button:has-text(/submit|提交|发布/i)',
  getFree: 'button:has-text(/get.*free|免费.*获取|获取/i)',
  purchase: 'button:has-text(/purchase|buy|购买/i)',
  history: 'a:has-text(/history|历史|版本/i), button:has-text(/history|历史|版本/i)',
  refresh: 'button:has-text(/refresh|刷新/i)',
}

// 断言辅助
export async function assertElementVisible(page: Page, selector: string, message?: string) {
  const element = page.locator(selector).first()
  await expect(element, message).toBeVisible({ timeout: 5000 })
}

export async function assertElementNotVisible(page: Page, selector: string, message?: string) {
  const element = page.locator(selector).first()
  await expect(element, message).not.toBeVisible({ timeout: 5000 })
}

// 错误上下文收集
export async function captureErrorContext(page: Page, testName: string) {
  const context = {
    url: page.url(),
    title: await page.title(),
    timestamp: new Date().toISOString(),
    testName,
  }
  
  const outputDir = path.join(__dirname, '../test-results')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  fs.writeFileSync(
    path.join(outputDir, `${testName}-error-context.json`),
    JSON.stringify(context, null, 2)
  )
}
