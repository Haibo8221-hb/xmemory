import { test, expect } from '@playwright/test'

test.describe('公开页面', () => {
  
  test('首页正常加载', async ({ page }) => {
    await page.goto('/')
    
    // 验证页面标题
    await expect(page).toHaveTitle(/xmemory/i)
    
    // 验证核心内容存在
    await expect(page.locator('text=/AI.*Memory|Let Your AI/i').first()).toBeVisible()
    
    // 验证导航链接
    await expect(page.locator('a[href="/pricing"], a[href="/explore"]').first()).toBeVisible()
  })
  
  test('定价页正常加载', async ({ page }) => {
    await page.goto('/pricing')
    
    // 验证页面内容
    await expect(page.locator('text=/pricing|定价|价格|plan|套餐/i').first()).toBeVisible()
    
    // 验证至少有一个价格显示
    await expect(page.locator('text=/\\$|free|免费/i').first()).toBeVisible()
  })
  
  test('登录页正常加载', async ({ page }) => {
    await page.goto('/auth/login')
    
    // 验证登录表单或 OAuth 按钮存在
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').first().isVisible().catch(() => false)
    const hasOAuthButton = await page.locator('text=/google|sign in|登录/i').first().isVisible().catch(() => false)
    
    expect(hasLoginForm || hasOAuthButton).toBeTruthy()
  })
  
  test('市场页正常加载', async ({ page }) => {
    await page.goto('/explore')
    
    // 验证页面加载
    await expect(page.url()).toContain('/explore')
    
    // 验证市场相关内容
    await expect(page.locator('text=/explore|memory|memories|浏览|市场/i').first()).toBeVisible()
  })
  
  test('Memory 详情页可访问（如有数据）', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // 查找 Memory 链接
    const memoryLink = page.locator('a[href^="/memory/"]').first()
    
    if (await memoryLink.isVisible().catch(() => false)) {
      const href = await memoryLink.getAttribute('href')
      await page.goto(href!)
      
      // 验证详情页内容
      await expect(page.locator('text=/description|描述|purchase|购买|free|免费/i').first()).toBeVisible()
    } else {
      // 市场暂无 Memory，这是允许的
      console.log('  ℹ 市场暂无 Memory，跳过详情页测试')
    }
  })
  
  test('404 页面正确显示', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')
    
    // 应该返回 404 或显示 not found 内容
    const is404 = response?.status() === 404
    const hasNotFoundText = await page.locator('text=/not found|404|找不到/i').first().isVisible().catch(() => false)
    
    expect(is404 || hasNotFoundText).toBeTruthy()
  })
})
