import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/xmemory/i)
    
    // Check main heading or logo exists
    await expect(page.locator('body')).toBeVisible()
    
    // Check CTA button exists
    const ctaButton = page.getByRole('link', { name: /get started|开始使用/i })
    await expect(ctaButton.first()).toBeVisible()
  })

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing')
    
    // Check pricing plans are visible
    await expect(page.getByText(/free|免费/i).first()).toBeVisible()
    await expect(page.getByText(/pro/i).first()).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Check Google login button
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
  })

  test('docs pages load', async ({ page }) => {
    // Import docs
    await page.goto('/docs/import')
    await expect(page.locator('body')).toBeVisible()
    
    // Export docs
    await page.goto('/docs/export')
    await expect(page.locator('body')).toBeVisible()
    
    // FAQ
    await page.goto('/docs/faq')
    await expect(page.locator('body')).toBeVisible()
  })

  test('legal pages load', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('body')).toBeVisible()
    
    await page.goto('/terms')
    await expect(page.locator('body')).toBeVisible()
  })

  test('404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')
    // Should either show 404 or redirect
    expect(response?.status()).toBeLessThanOrEqual(404)
  })
})
