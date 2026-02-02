import { test, expect, Page } from '@playwright/test'

// Helper to set up authenticated session
async function setupAuth(page: Page) {
  const sessionCookie = process.env.TEST_SESSION_COOKIE
  if (!sessionCookie) {
    return false
  }
  
  await page.context().addCookies([{
    name: 'sb-uupwzvbrcmiwkutgeqza-auth-token',
    value: sessionCookie,
    domain: 'xmemory.work',
    path: '/'
  }])
  return true
}

test.describe('Marketplace - Public', () => {
  test('explore page loads', async ({ page }) => {
    await page.goto('/explore')
    
    await expect(page.url()).toContain('/explore')
    // Should show marketplace content
    await expect(page.getByText(/memory|memories|explore|浏览/i).first()).toBeVisible()
  })

  test('memory detail page loads', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // Find a memory card and click it
    const memoryLink = page.locator('a[href^="/memory/"]').first()
    
    if (await memoryLink.isVisible()) {
      await memoryLink.click()
      await page.waitForURL(/\/memory\//i, { timeout: 10000 })
      
      // Should show memory details
      await expect(page.getByText(/description|描述|purchase|购买|免费|free/i).first()).toBeVisible()
    } else {
      // No memories in marketplace - skip
      test.skip(true, 'No memories in marketplace to test')
    }
  })

  test('purchase button visible on memory detail', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    const memoryLink = page.locator('a[href^="/memory/"]').first()
    
    if (await memoryLink.isVisible()) {
      await memoryLink.click()
      await page.waitForURL(/\/memory\//i, { timeout: 10000 })
      
      // Should have a purchase/get button
      const purchaseButton = page.getByRole('button', { name: /purchase|buy|get|购买|免费|获取/i })
      await expect(purchaseButton).toBeVisible({ timeout: 5000 })
    } else {
      test.skip(true, 'No memories in marketplace to test')
    }
  })
})

test.describe('Marketplace - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    const hasAuth = await setupAuth(page)
    if (!hasAuth) {
      test.skip()
    }
  })

  test('can get free memory', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    
    // Find a free memory (price = $0 or shows "Free")
    const freeMemoryCard = page.locator('text=/free|免费|\\$0/i').first()
    
    if (await freeMemoryCard.isVisible()) {
      // Navigate to the memory page
      const card = freeMemoryCard.locator('xpath=ancestor::a[@href]')
      if (await card.isVisible()) {
        await card.click()
      } else {
        // Click parent card or navigate manually
        await freeMemoryCard.click()
      }
      
      await page.waitForURL(/\/memory\//i, { timeout: 10000 })
      
      // Click the get free button
      const getFreeButton = page.getByRole('button', { name: /get.*free|免费.*获取|获取/i })
      
      if (await getFreeButton.isVisible()) {
        await getFreeButton.click()
        
        // Wait for download button to appear
        const downloadButton = page.getByRole('button', { name: /download|下载/i })
        await expect(downloadButton).toBeVisible({ timeout: 10000 })
        
        // Test download
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
        await downloadButton.click()
        
        const download = await downloadPromise
        expect(download.suggestedFilename()).toMatch(/\.json$/i)
      }
    } else {
      test.skip(true, 'No free memories available to test')
    }
  })

  test('purchases page loads', async ({ page }) => {
    await page.goto('/dashboard/purchases')
    
    await expect(page.url()).toContain('/dashboard/purchases')
    // Should show purchases page content
    await expect(page.getByText(/我买的|purchases|购买/i).first()).toBeVisible()
  })

  test('can download purchased memory', async ({ page }) => {
    await page.goto('/dashboard/purchases')
    await page.waitForLoadState('networkidle')
    
    // Check if there are any purchases
    const emptyState = page.locator('text=/no.*purchase|还没有.*购买|没有购买/i')
    const hasPurchases = !(await emptyState.isVisible().catch(() => false))
    
    if (!hasPurchases) {
      test.skip(true, 'No purchases available to test download')
      return
    }
    
    // Find download button
    const downloadButton = page.getByRole('button', { name: /download|下载/i }).first()
    await expect(downloadButton).toBeVisible({ timeout: 5000 })
    
    // Test download
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
    await downloadButton.click()
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/i)
  })
})

test.describe('Marketplace API', () => {
  test('checkout API returns 400 without memoryId', async ({ request }) => {
    const response = await request.post('/api/checkout', {
      data: {}
    })
    expect(response.status()).toBe(400)
  })

  test('checkout API returns 404 for invalid memoryId', async ({ request }) => {
    const response = await request.post('/api/checkout', {
      data: { memoryId: 'non-existent-id-12345' }
    })
    expect(response.status()).toBe(404)
  })
})
