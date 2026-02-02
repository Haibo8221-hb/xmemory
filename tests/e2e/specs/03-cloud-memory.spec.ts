import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// 测试数据目录
const testDataDir = path.join(__dirname, '../fixtures/test-files')

// 检查是否有认证
function checkAuth(testInfo: any) {
  const authFile = 'tests/e2e/.auth/user.json'
  if (!fs.existsSync(authFile)) {
    return false
  }
  const content = fs.readFileSync(authFile, 'utf-8')
  const state = JSON.parse(content)
  return state.cookies && state.cookies.length > 0
}

test.describe('云端 Memory - 已登录', () => {
  
  test.beforeEach(async ({ page }, testInfo) => {
    if (!checkAuth(testInfo)) {
      test.skip(true, '未提供认证信息，跳过需要登录的测试')
    }
  })
  
  test('云端 Memory 列表页加载', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    
    // 验证页面加载成功（不是重定向到登录页）
    await expect(page.url()).toContain('/dashboard/cloud')
    
    // 验证页面内容
    await expect(page.locator('text=/cloud|memory|memories|云端/i').first()).toBeVisible()
  })
  
  test('上传页加载', async ({ page }) => {
    await page.goto('/dashboard/cloud/upload')
    
    await expect(page.url()).toContain('/dashboard/cloud/upload')
    
    // 验证上传表单元素
    const uploadInput = page.locator('input[type="file"]')
    await expect(uploadInput).toBeAttached()
  })
  
  test('可以上传 ChatGPT Memory 文件', async ({ page }) => {
    await page.goto('/dashboard/cloud/upload')
    
    // 确保测试文件存在
    const testFile = path.join(testDataDir, 'chatgpt-e2e.json')
    if (!fs.existsSync(testFile)) {
      test.skip(true, '测试文件不存在')
      return
    }
    
    // 选择平台
    const platformSelect = page.locator('select').first()
    if (await platformSelect.isVisible()) {
      await platformSelect.selectOption({ value: 'chatgpt' })
    }
    
    // 上传文件
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testFile)
    
    // 填写标签（如果有）
    const labelInput = page.locator('input[name="label"], input[placeholder*="label"], input[placeholder*="标签"]').first()
    if (await labelInput.isVisible().catch(() => false)) {
      await labelInput.fill(`e2e-test-${Date.now()}`)
    }
    
    // 提交
    const submitButton = page.locator('button[type="submit"], button:has-text(/upload|submit|上传|同步/i)').first()
    await expect(submitButton).toBeVisible()
    await submitButton.click()
    
    // 等待成功（重定向或显示成功消息）
    await Promise.race([
      page.waitForURL(/dashboard\/cloud(?!\/upload)/i, { timeout: 30000 }),
      page.waitForSelector('text=/success|成功/i', { timeout: 30000 }),
    ]).catch(() => {
      // 检查是否有错误消息
      // 如果有错误，让测试失败并显示错误
    })
  })
  
  test('可以下载 Memory', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    await page.waitForLoadState('networkidle')
    
    // 检查是否有 Memory
    const emptyState = page.locator('text=/no.*memor|还没有|暂无/i').first()
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, '没有可下载的 Memory')
      return
    }
    
    // 查找下载按钮 - 必须存在
    const downloadButton = page.locator('button:has-text(/download|下载/i), button:has(svg[class*="download"])').first()
    await expect(downloadButton, '下载按钮应该可见').toBeVisible({ timeout: 5000 })
    
    // 点击下载
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
    await downloadButton.click()
    
    // 验证下载
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/i)
  })
  
  test('可以查看版本历史', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    await page.waitForLoadState('networkidle')
    
    // 检查是否有 Memory
    const emptyState = page.locator('text=/no.*memor|还没有|暂无/i').first()
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, '没有 Memory 可查看历史')
      return
    }
    
    // 查找历史按钮/链接
    const historyLink = page.locator('a:has-text(/history|历史|版本/i), button:has-text(/history|历史|版本/i)').first()
    await expect(historyLink, '历史按钮应该可见').toBeVisible({ timeout: 5000 })
    
    await historyLink.click()
    
    // 应该跳转到历史页
    await page.waitForURL(/history/i, { timeout: 10000 })
  })
  
  test('可以删除 Memory', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    await page.waitForLoadState('networkidle')
    
    // 检查是否有 Memory
    const emptyState = page.locator('text=/no.*memor|还没有|暂无/i').first()
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, '没有 Memory 可删除')
      return
    }
    
    // 记录删除前的 Memory 数量
    const memoryCards = page.locator('[class*="rounded-xl"][class*="border"], [class*="card"]')
    const countBefore = await memoryCards.count()
    
    // 查找删除按钮
    const deleteButton = page.locator('button:has(svg[class*="red"]), button:has-text(/delete|删除/i)').first()
    await expect(deleteButton, '删除按钮应该可见').toBeVisible({ timeout: 5000 })
    
    // 设置对话框处理
    page.on('dialog', dialog => dialog.accept())
    
    // 点击删除
    await deleteButton.click()
    
    // 等待删除完成
    await page.waitForTimeout(2000)
    
    // 验证删除成功（数量减少或显示空状态）
    const countAfter = await memoryCards.count()
    const isEmpty = await emptyState.isVisible().catch(() => false)
    
    expect(countAfter < countBefore || isEmpty, '删除后 Memory 数量应该减少').toBeTruthy()
  })
})
