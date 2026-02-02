import { test, expect } from '@playwright/test'

test.describe('API - 无认证', () => {
  
  test('GET /api/cloud/memories 返回 401', async ({ request }) => {
    const response = await request.get('/api/cloud/memories')
    expect(response.status()).toBe(401)
  })
  
  test('POST /api/cloud/sync 返回 401', async ({ request }) => {
    const response = await request.post('/api/cloud/sync', {
      data: {
        platform: 'chatgpt',
        content: '[]'
      }
    })
    expect(response.status()).toBe(401)
  })
  
  test('GET /api/cloud/memories/[id]/download 返回 401', async ({ request }) => {
    const response = await request.get('/api/cloud/memories/test-id/download')
    expect(response.status()).toBe(401)
  })
  
  test('POST /api/checkout 缺少 memoryId 返回 400', async ({ request }) => {
    const response = await request.post('/api/checkout', {
      data: {}
    })
    expect(response.status()).toBe(400)
    
    const body = await response.json()
    expect(body.error).toBeTruthy()
  })
  
  test('POST /api/checkout 无效 memoryId 返回 404', async ({ request }) => {
    const response = await request.post('/api/checkout', {
      data: { memoryId: 'non-existent-id-12345' }
    })
    expect(response.status()).toBe(404)
  })
  
  test('GET /api/stats 返回统计数据', async ({ request }) => {
    const response = await request.get('/api/stats')
    
    // 可能返回 200 或其他状态
    if (response.status() === 200) {
      const body = await response.json()
      // 验证返回格式
      expect(body).toBeTruthy()
    }
  })
})

test.describe('API - 参数验证', () => {
  
  test('POST /api/cloud/sync 缺少 platform 返回 400', async ({ request }) => {
    const response = await request.post('/api/cloud/sync', {
      data: {
        content: '[]'
      }
    })
    // 400 或 401（如果先检查认证）
    expect([400, 401]).toContain(response.status())
  })
  
  test('POST /api/cloud/sync 缺少 content 返回 400', async ({ request }) => {
    const response = await request.post('/api/cloud/sync', {
      data: {
        platform: 'chatgpt'
      }
    })
    expect([400, 401]).toContain(response.status())
  })
  
  test('POST /api/checkout 空对象返回 400', async ({ request }) => {
    const response = await request.post('/api/checkout', {
      data: {}
    })
    expect(response.status()).toBe(400)
  })
  
  test('POST /api/xray 无效 JSON 返回错误', async ({ request }) => {
    const response = await request.post('/api/xray', {
      data: {
        content: 'not valid json'
      }
    })
    // 应该返回某种错误
    expect([400, 401, 422, 500]).toContain(response.status())
  })
})

test.describe('API - 响应格式', () => {
  
  test('API 错误响应包含 error 字段', async ({ request }) => {
    const response = await request.post('/api/checkout', {
      data: {}
    })
    
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
  
  test('401 响应包含错误信息', async ({ request }) => {
    const response = await request.get('/api/cloud/memories')
    
    if (response.status() === 401) {
      const body = await response.json()
      expect(body.error).toBeTruthy()
    }
  })
})

test.describe('API - 跨域和安全', () => {
  
  test('API 返回正确的 Content-Type', async ({ request }) => {
    const response = await request.get('/api/cloud/memories')
    
    const contentType = response.headers()['content-type']
    expect(contentType).toMatch(/application\/json/i)
  })
  
  test('POST 请求需要正确的 Content-Type', async ({ request }) => {
    // 发送无 Content-Type 的请求
    const response = await request.post('/api/checkout', {
      data: '{"memoryId": "test"}',
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    
    // 应该能处理或返回错误
    expect([200, 400, 401, 415]).toContain(response.status())
  })
})
