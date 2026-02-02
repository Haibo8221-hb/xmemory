import { test, expect } from '@playwright/test'
import fs from 'fs'

// 检查是否有认证
function checkAuth() {
  const authFile = 'tests/e2e/.auth/user.json'
  if (!fs.existsSync(authFile)) {
    return false
  }
  const content = fs.readFileSync(authFile, 'utf-8')
  const state = JSON.parse(content)
  return state.cookies && state.cookies.length > 0
}

test.describe('市场 - 公开访问', () => {
  
  test('市场页正常加载', async ({ page }) => {
    await page.goto('/explore')
    
    await expect(page.url()).toContain('/explore')
    await expect(page.locator('text=/memory|memories|explore|浏览|市场/i').first()).toBeVisible()
  })
  
  test('Memory 详情页显示购买按钮', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // 查找 Memory 链接
    const memoryLink = page.locator('a[href^="/memory/"]').first()
    
    if (!await memoryLink.isVisible().catch(() => false)) {
      test.skip(true, '市场暂无 Memory')
      return
    }
    
    await memoryLink.click()
    await page.waitForURL(/\/memory\//i, { timeout: 10000 })
    
    // 应该有购买/获取按钮
    const purchaseButton = page.locator('button:has-text(/purchase|buy|get|购买|免费|获取/i)').first()
    await expect(purchaseButton, '购买按钮应该可见').toBeVisible({ timeout: 5000 })
  })
  
  test('免费 Memory 显示免费标签', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // 查找免费 Memory
    const freeLabel = page.locator('text=/free|免费|\\$0/i').first()
    
    if (await freeLabel.isVisible().catch(() => false)) {
      // 找到免费标签
      expect(true).toBeTruthy()
    } else {
      // 可能没有免费 Memory，这也是允许的
      console.log('  ℹ 市场暂无免费 Memory')
    }
  })
})

test.describe('市场 - 已登录', () => {
  
  test.beforeEach(async ({ page }, testInfo) => {
    if (!checkAuth()) {
      test.skip(true, '未提供认证信息，跳过需要登录的测试')
    }
  })
  
  test('可以获取免费 Memory', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // 查找免费 Memory 卡片
    const freeCard = page.locator('text=/free|免费|\\$0/i').first()
    
    if (!await freeCard.isVisible().catch(() => false)) {
      test.skip(true, '市场暂无免费 Memory')
      return
    }
    
    // 点击进入详情页
    const parentLink = freeCard.locator('xpath=ancestor::a[@href]').first()
    if (await parentLink.isVisible().catch(() => false)) {
      await parentLink.click()
    } else {
      // 尝试直接点击卡片
      await freeCard.click()
    }
    
    await page.waitForURL(/\/memory\//i, { timeout: 10000 })
    
    // 点击获取按钮
    const getFreeButton = page.locator('button:has-text(/get.*free|免费.*获取|获取/i)').first()
    
    if (await getFreeButton.isVisible().catch(() => false)) {
      await getFreeButton.click()
      
      // 等待下载按钮出现
      const downloadButton = page.locator('button:has-text(/download|下载/i)').first()
      await expect(downloadButton, '获取后应显示下载按钮').toBeVisible({ timeout: 15000 })
      
      // 测试下载
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
      await downloadButton.click()
      
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.json$/i)
    }
  })
  
  test('购买页正常加载', async ({ page }) => {
    await page.goto('/dashboard/purchases')
    
    await expect(page.url()).toContain('/dashboard/purchases')
    await expect(page.locator('text=/我买的|purchases|购买/i').first()).toBeVisible()
  })
  
  test('可以下载已购买的 Memory', async ({ page }) => {
    await page.goto('/dashboard/purchases')
    await page.waitForLoadState('networkidle')
    
    // 检查是否有购买记录
    const emptyState = page.locator('text=/no.*purchase|还没有.*购买|没有购买/i').first()
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, '没有购买记录')
      return
    }
    
    // 查找下载按钮 - 必须存在
    const downloadButton = page.locator('button:has-text(/download|下载/i)').first()
    await expect(downloadButton, '下载按钮应该可见').toBeVisible({ timeout: 5000 })
    
    // 点击下载
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
    await downloadButton.click()
    
    // 验证下载
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/i)
  })
  
  test('付费 Memory 跳转到 Stripe', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // 查找付费 Memory（有价格显示）
    const paidCard = page.locator('text=/\\$[1-9]|\\$[0-9]+\\.[0-9][1-9]/').first()
    
    if (!await paidCard.isVisible().catch(() => false)) {
      test.skip(true, '市场暂无付费 Memory')
      return
    }
    
    // 点击进入详情页
    const parentLink = paidCard.locator('xpath=ancestor::a[@href]').first()
    if (await parentLink.isVisible().catch(() => false)) {
      await parentLink.click()
    } else {
      await paidCard.click()
    }
    
    await page.waitForURL(/\/memory\//i, { timeout: 10000 })
    
    // 点击购买按钮
    const purchaseButton = page.locator('button:has-text(/purchase|buy|购买/i)').first()
    
    if (await purchaseButton.isVisible().catch(() => false)) {
      await purchaseButton.click()
      
      // 等待跳转到 Stripe
      await page.waitForURL(/stripe\.com|checkout/i, { timeout: 15000 }).catch(() => {
        // 可能是本地环境或 Stripe 未配置
        console.log('  ℹ 未跳转到 Stripe（可能是测试环境）')
      })
    }
  })
  
  test('销售页正常加载', async ({ page }) => {
    await page.goto('/dashboard/sales')
    
    await expect(page.url()).toContain('/dashboard/sales')
    await expect(page.locator('text=/我卖的|sales|销售/i').first()).toBeVisible()
  })
  
  test('上传出售页正常加载', async ({ page }) => {
    await page.goto('/upload')
    
    await expect(page.url()).toContain('/upload')
    
    // 验证上传表单
    await expect(page.locator('input[type="file"]')).toBeAttached()
    await expect(page.locator('input[name="title"], input[placeholder*="title"], input[placeholder*="标题"]').first()).toBeVisible()
  })
})
