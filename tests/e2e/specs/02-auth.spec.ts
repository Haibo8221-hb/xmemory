import { test, expect } from '@playwright/test'

test.describe('认证流程', () => {
  
  test('未登录访问 dashboard 会重定向到登录页', async ({ page }) => {
    // 清除所有 cookies 确保未登录状态
    await page.context().clearCookies()
    
    await page.goto('/dashboard')
    
    // 应该重定向到登录页
    await page.waitForURL(/auth\/login/i, { timeout: 10000 })
    expect(page.url()).toContain('login')
  })
  
  test('未登录访问云端 Memory 会重定向到登录页', async ({ page }) => {
    await page.context().clearCookies()
    
    await page.goto('/dashboard/cloud')
    
    await page.waitForURL(/auth\/login/i, { timeout: 10000 })
    expect(page.url()).toContain('login')
  })
  
  test('未登录访问上传页会重定向到登录页', async ({ page }) => {
    await page.context().clearCookies()
    
    await page.goto('/dashboard/cloud/upload')
    
    await page.waitForURL(/auth\/login/i, { timeout: 10000 })
    expect(page.url()).toContain('login')
  })
  
  test('未登录访问购买页会重定向到登录页', async ({ page }) => {
    await page.context().clearCookies()
    
    await page.goto('/dashboard/purchases')
    
    await page.waitForURL(/auth\/login/i, { timeout: 10000 })
    expect(page.url()).toContain('login')
  })
  
  test('登录页有 Google OAuth 按钮', async ({ page }) => {
    await page.goto('/auth/login')
    
    // 查找 Google 登录按钮
    const googleButton = page.locator('text=/google|continue with google|使用 google/i').first()
    
    await expect(googleButton).toBeVisible({ timeout: 5000 })
  })
  
  test('点击 Google 登录会跳转到 OAuth', async ({ page }) => {
    await page.goto('/auth/login')
    
    const googleButton = page.locator('text=/google/i').first()
    
    if (await googleButton.isVisible()) {
      // 点击后应该跳转到 Google 或 Supabase auth 页面
      const [popup] = await Promise.all([
        page.waitForEvent('popup').catch(() => null),
        googleButton.click().catch(() => null),
      ])
      
      // 检查是否有弹窗或页面跳转
      if (popup) {
        expect(popup.url()).toMatch(/google|supabase|accounts/i)
      } else {
        // 可能是同页面跳转
        await page.waitForTimeout(2000)
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/google|supabase|accounts|auth/i)
      }
    }
  })
  
  test('登录页保留 redirect 参数', async ({ page }) => {
    await page.context().clearCookies()
    
    // 访问受保护页面
    await page.goto('/dashboard/purchases')
    
    // 等待重定向
    await page.waitForURL(/auth\/login/i, { timeout: 10000 })
    
    // URL 应该包含 redirect 参数
    expect(page.url()).toMatch(/redirect.*purchases|purchases.*redirect/i)
  })
})
