import { defineConfig, devices } from '@playwright/test'
import path from 'path'

// 测试环境配置
const isCI = !!process.env.CI
const baseURL = process.env.TEST_BASE_URL || 'https://xmemory.work'

export default defineConfig({
  testDir: './specs',
  
  // 测试超时
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  
  // 并行执行（CI 环境串行以确保稳定性）
  fullyParallel: !isCI,
  workers: isCI ? 1 : undefined,
  
  // 失败重试
  retries: isCI ? 2 : 0,
  
  // 报告
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // 全局设置
  globalSetup: path.join(__dirname, 'global-setup.ts'),
  globalTeardown: path.join(__dirname, 'global-teardown.ts'),
  
  use: {
    baseURL,
    
    // 截图和录像
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    trace: 'retain-on-failure',
    
    // 浏览器设置
    headless: isCI,
    viewport: { width: 1280, height: 720 },
    
    // 网络设置
    actionTimeout: 10 * 1000,
    navigationTimeout: 15 * 1000,
  },

  projects: [
    // 无需认证的测试
    {
      name: 'public',
      testMatch: /01-public-pages\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // 认证流程测试
    {
      name: 'auth',
      testMatch: /02-auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // 需要登录的测试 - 使用存储状态
    {
      name: 'authenticated',
      testMatch: /0[3-9]-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },
    
    // 认证设置（生成存储状态）
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // API 测试
    {
      name: 'api',
      testMatch: /05-api\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
