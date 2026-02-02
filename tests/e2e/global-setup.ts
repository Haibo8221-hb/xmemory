import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalSetup(config: FullConfig) {
  console.log('\n🚀 E2E 测试全局初始化...\n')
  
  // 1. 确保测试目录存在
  const dirs = [
    'tests/e2e/.auth',
    'tests/e2e/test-results',
    'tests/e2e/fixtures/test-files',
  ]
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`  ✓ 创建目录: ${dir}`)
    }
  }
  
  // 2. 生成测试用 Memory 文件
  const chatgptTestData = JSON.stringify([
    { id: 'e2e-1', key: 'E2E Test Memory', value: 'This is a test memory for E2E testing', created_at: new Date().toISOString() },
    { id: 'e2e-2', key: 'Another Test', value: 'Another test value', created_at: new Date().toISOString() },
  ], null, 2)
  
  const claudeTestData = JSON.stringify({
    memories: [
      { id: 'e2e-claude-1', key: 'Claude E2E Test', value: 'Claude test memory' },
    ],
    metadata: { exported_at: new Date().toISOString() }
  }, null, 2)
  
  fs.writeFileSync('tests/e2e/fixtures/test-files/chatgpt-e2e.json', chatgptTestData)
  fs.writeFileSync('tests/e2e/fixtures/test-files/claude-e2e.json', claudeTestData)
  console.log('  ✓ 生成测试数据文件')
  
  // 3. 检查环境变量
  const requiredEnvVars = ['TEST_BASE_URL']
  const optionalEnvVars = ['TEST_USER_EMAIL', 'TEST_USER_PASSWORD', 'TEST_SESSION_COOKIE']
  
  console.log('\n  环境变量检查:')
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    console.log(`    ${envVar}: ${value ? '✓' : '✗ (使用默认值)'}`)
  }
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar]
    console.log(`    ${envVar}: ${value ? '✓' : '✗ (需要认证测试时必须提供)'}`)
  }
  
  // 4. 如果有 session cookie，创建存储状态
  const sessionCookie = process.env.TEST_SESSION_COOKIE
  if (sessionCookie) {
    const baseURL = process.env.TEST_BASE_URL || 'https://xmemory.work'
    const domain = new URL(baseURL).hostname
    
    const storageState = {
      cookies: [{
        name: 'sb-uupwzvbrcmiwkutgeqza-auth-token',
        value: sessionCookie,
        domain: domain,
        path: '/',
        expires: -1,
        httpOnly: true,
        secure: true,
        sameSite: 'Lax' as const,
      }],
      origins: [],
    }
    
    fs.writeFileSync('tests/e2e/.auth/user.json', JSON.stringify(storageState, null, 2))
    console.log('  ✓ 创建认证状态文件')
  } else {
    console.log('  ⚠ 未提供 TEST_SESSION_COOKIE，认证测试将被跳过')
  }
  
  console.log('\n✅ 全局初始化完成\n')
}

export default globalSetup
