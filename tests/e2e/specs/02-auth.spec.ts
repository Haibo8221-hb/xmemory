import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login
    await page.waitForURL(/auth\/login|\/$/i, { timeout: 10000 })
  })

  test('unauthenticated user is redirected from cloud page', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    
    // Should redirect to login
    await page.waitForURL(/auth\/login|\/$/i, { timeout: 10000 })
  })

  test('API returns 401 for unauthenticated requests', async ({ request }) => {
    const response = await request.get('/api/cloud/memories')
    expect(response.status()).toBe(401)
  })

  test('Google login button initiates OAuth flow', async ({ page }) => {
    await page.goto('/auth/login')
    
    const googleButton = page.getByRole('button', { name: /google/i })
    await expect(googleButton).toBeVisible()
    
    // Click and check redirect to Google
    const [popup] = await Promise.all([
      page.waitForEvent('popup').catch(() => null),
      page.waitForURL(/accounts\.google\.com|api\/auth\/google/i, { timeout: 5000 }).catch(() => null),
      googleButton.click()
    ])
    
    // Either opens popup or redirects - both are valid
    if (popup) {
      await expect(popup.url()).toMatch(/accounts\.google\.com/i)
    } else {
      // Check current page URL changed
      const url = page.url()
      expect(url).toMatch(/accounts\.google\.com|api\/auth\/google/i)
    }
  })
})

test.describe('Authenticated Session', () => {
  // These tests require a valid session
  // Skip if no auth cookie provided
  
  test.skip('dashboard loads when authenticated', async ({ page }) => {
    // This test requires manual session setup
    // Use: TEST_SESSION_COOKIE=xxx npx playwright test
    
    const sessionCookie = process.env.TEST_SESSION_COOKIE
    if (!sessionCookie) {
      test.skip()
      return
    }
    
    // Set cookie and navigate
    await page.context().addCookies([{
      name: 'sb-uupwzvbrcmiwkutgeqza-auth-token',
      value: sessionCookie,
      domain: 'xmemory.work',
      path: '/'
    }])
    
    await page.goto('/dashboard')
    await expect(page.url()).toContain('/dashboard')
  })
})
