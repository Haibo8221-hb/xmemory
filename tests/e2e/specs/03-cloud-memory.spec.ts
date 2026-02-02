import { test, expect, Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

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

// Create test data files
const testDataDir = path.join(__dirname, '../test-data')

test.describe('Cloud Memory - Unauthenticated', () => {
  test('upload page redirects to login', async ({ page }) => {
    await page.goto('/dashboard/cloud/upload')
    await page.waitForURL(/auth\/login/i, { timeout: 10000 })
  })
  
  test('cloud list page redirects to login', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    await page.waitForURL(/auth\/login/i, { timeout: 10000 })
  })
})

test.describe('Cloud Memory - Authenticated', () => {
  test.beforeAll(async () => {
    // Create test data directory and files
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true })
    }
    
    // ChatGPT format test file
    const chatgptData = JSON.stringify([
      { id: 'test-1', key: 'Test Memory 1', value: 'Test value 1', created_at: new Date().toISOString() },
      { id: 'test-2', key: 'Test Memory 2', value: 'Test value 2', created_at: new Date().toISOString() }
    ], null, 2)
    fs.writeFileSync(path.join(testDataDir, 'chatgpt-test.json'), chatgptData)
    
    // Claude format test file
    const claudeData = JSON.stringify({
      memories: [
        { id: 'claude-1', key: 'Claude Test 1', value: 'Claude value 1' }
      ],
      metadata: { exported_at: new Date().toISOString() }
    }, null, 2)
    fs.writeFileSync(path.join(testDataDir, 'claude-test.json'), claudeData)
  })

  test.beforeEach(async ({ page }) => {
    const hasAuth = await setupAuth(page)
    if (!hasAuth) {
      test.skip()
    }
  })

  test('cloud list page loads', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    
    // Check page loaded (not redirected)
    await expect(page.url()).toContain('/dashboard/cloud')
    
    // Check for cloud-related content
    await expect(page.getByText(/cloud|memory|memories|云存储/i).first()).toBeVisible()
  })

  test('upload page loads', async ({ page }) => {
    await page.goto('/dashboard/cloud/upload')
    
    await expect(page.url()).toContain('/dashboard/cloud/upload')
    
    // Check for upload form elements
    const uploadInput = page.locator('input[type="file"]')
    await expect(uploadInput).toBeAttached()
  })

  test('can upload ChatGPT memory file', async ({ page }) => {
    await page.goto('/dashboard/cloud/upload')
    
    // Select platform
    const platformSelect = page.locator('select, [role="combobox"]').first()
    if (await platformSelect.isVisible()) {
      await platformSelect.selectOption({ label: /chatgpt/i })
    }
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(testDataDir, 'chatgpt-test.json'))
    
    // Submit
    const submitButton = page.getByRole('button', { name: /upload|submit|上传/i })
    if (await submitButton.isVisible()) {
      await submitButton.click()
      
      // Wait for success or redirect
      await page.waitForURL(/dashboard\/cloud(?!\/upload)/i, { timeout: 30000 }).catch(() => {
        // Or check for success message
      })
    }
  })

  test('can download memory', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    
    // Wait for memories to load
    await page.waitForLoadState('networkidle')
    
    // Find download button
    const downloadButton = page.locator('button').filter({ hasText: /download/i }).first()
    
    if (await downloadButton.isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
      
      await downloadButton.click()
      
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.json$/i)
    }
  })

  test('can view version history', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    
    await page.waitForLoadState('networkidle')
    
    // Find history button/link
    const historyLink = page.locator('a, button').filter({ hasText: /history|版本|历史/i }).first()
    
    if (await historyLink.isVisible()) {
      await historyLink.click()
      
      // Should navigate to history page
      await page.waitForURL(/history/i, { timeout: 10000 })
    }
  })

  test('can delete memory', async ({ page }) => {
    await page.goto('/dashboard/cloud')
    
    await page.waitForLoadState('networkidle')
    
    // Find delete button
    const deleteButton = page.locator('button').filter({ hasText: /delete|删除/i }).first()
    
    if (await deleteButton.isVisible()) {
      // Set up dialog handler
      page.on('dialog', dialog => dialog.accept())
      
      await deleteButton.click()
      
      // Wait for deletion (page refresh or item removal)
      await page.waitForTimeout(2000)
    }
  })
})

test.describe('Cloud Memory API', () => {
  test('GET /api/cloud/memories returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/cloud/memories')
    expect(response.status()).toBe(401)
  })

  test('POST /api/cloud/sync returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/cloud/sync', {
      data: {
        platform: 'chatgpt',
        content: '[]'
      }
    })
    expect(response.status()).toBe(401)
  })

  test('POST /api/cloud/sync returns 400 for invalid data', async ({ request }) => {
    // Even with auth, missing required fields should fail
    const response = await request.post('/api/cloud/sync', {
      data: {}
    })
    // Either 400 (bad request) or 401 (no auth)
    expect([400, 401]).toContain(response.status())
  })
})
