import { test as setup, expect } from '@playwright/test'
import fs from 'fs'

const authFile = 'tests/e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // 如果已经有认证文件，跳过
  if (fs.existsSync(authFile)) {
    const content = fs.readFileSync(authFile, 'utf-8')
    const state = JSON.parse(content)
    if (state.cookies && state.cookies.length > 0) {
      console.log('  ✓ 使用已有的认证状态')
      return
    }
  }
  
  // 检查是否有登录凭据
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD
  
  if (!email || !password) {
    console.log('  ⚠ 未提供登录凭据，跳过认证设置')
    console.log('    设置 TEST_USER_EMAIL 和 TEST_USER_PASSWORD 环境变量')
    console.log('    或者设置 TEST_SESSION_COOKIE')
    
    // 创建空的认证状态
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }))
    return
  }
  
  // 执行登录
  await page.goto('/auth/login')
  
  // 填写登录表单
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  
  // 等待登录成功
  await page.waitForURL(/dashboard|\/$/i, { timeout: 30000 })
  
  // 保存认证状态
  await page.context().storageState({ path: authFile })
  console.log('  ✓ 登录成功，已保存认证状态')
})
