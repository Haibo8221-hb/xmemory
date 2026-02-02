# xmemory E2E 测试方案

## 测试原则

1. **显式失败优于静默跳过** — 测试必须断言，不能用 `if` 包裹核心逻辑
2. **测试数据隔离** — 每次测试使用独立的测试数据，不依赖生产数据
3. **多语言支持** — 选择器同时匹配中英文
4. **完整流程覆盖** — 测试用户完整操作路径，不只是单个页面

---

## 测试分层

```
┌─────────────────────────────────────────────┐
│  E2E Tests (Playwright)                     │
│  - 用户完整流程                              │
│  - 跨页面交互                                │
│  - 真实浏览器环境                            │
├─────────────────────────────────────────────┤
│  API Tests (Playwright Request)             │
│  - 接口响应验证                              │
│  - 错误处理                                  │
│  - 权限控制                                  │
├─────────────────────────────────────────────┤
│  Unit Tests (待实现)                         │
│  - 工具函数                                  │
│  - 组件逻辑                                  │
└─────────────────────────────────────────────┘
```

---

## 测试场景覆盖

### 1. 公开页面 (无需登录)

| 场景 | 验证点 |
|------|--------|
| 首页加载 | 标题、核心功能展示 |
| 定价页 | 价格显示、套餐对比 |
| 登录页 | 表单元素、OAuth 按钮 |
| 市场浏览 | Memory 列表、筛选 |
| Memory 详情 | 信息展示、购买按钮 |

### 2. 认证流程

| 场景 | 验证点 |
|------|--------|
| 未登录访问受保护页面 | 重定向到登录页 |
| Google OAuth | 跳转正确 |
| 登录后跳转 | 回到原页面 |

### 3. 云端 Memory (需登录)

| 场景 | 验证点 |
|------|--------|
| 上传 Memory | 文件上传、平台选择、成功提示 |
| Memory 列表 | 显示已上传的 Memory |
| **下载 Memory** | 点击下载、文件保存 |
| 查看历史 | 版本列表展示 |
| 删除 Memory | 确认弹窗、删除成功 |

### 4. 市场交易 (需登录)

| 场景 | 验证点 |
|------|--------|
| 获取免费 Memory | 点击获取、下载按钮出现、下载成功 |
| 购买付费 Memory | 跳转 Stripe |
| **我的购买-下载** | 列表显示、下载功能正常 |
| 上传出售 | 表单填写、定价、发布成功 |
| 我的销售 | 销售列表、收益统计 |

### 5. API 接口

| 接口 | 验证点 |
|------|--------|
| GET /api/cloud/memories | 401 无认证、200 有认证 |
| POST /api/cloud/sync | 401 无认证、400 参数错误 |
| POST /api/checkout | 400 缺参数、404 无效ID |
| GET /api/cloud/memories/[id]/download | 401 无认证、200 下载成功 |

---

## 测试数据策略

### 方案: 测试前创建 Fixture

```typescript
// 每个测试套件开始前
test.beforeAll(async () => {
  // 1. 通过 API 创建测试用 Memory
  // 2. 上传测试文件到 Storage
  // 3. 创建测试订单记录
})

// 每个测试套件结束后
test.afterAll(async () => {
  // 清理测试数据
})
```

### 测试账号

使用专用测试账号，避免污染生产数据：
- 邮箱: `test@xmemory.work`
- 通过环境变量注入 session cookie

---

## 运行方式

```bash
# 本地运行（有界面）
npm run test:e2e

# CI 运行（无界面）
npm run test:e2e:ci

# 只运行特定测试
npm run test:e2e -- --grep "download"

# 生成报告
npm run test:e2e:report
```

---

## CI/CD 集成

```yaml
# GitHub Actions
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e:ci
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: tests/e2e/test-results/
```

---

## 文件结构

```
tests/e2e/
├── playwright.config.ts    # Playwright 配置
├── global-setup.ts         # 全局初始化（登录、数据准备）
├── global-teardown.ts      # 全局清理
├── fixtures/
│   ├── auth.fixture.ts     # 认证 fixture
│   ├── data.fixture.ts     # 测试数据 fixture
│   └── test-files/         # 测试用上传文件
├── specs/
│   ├── 01-public-pages.spec.ts
│   ├── 02-auth.spec.ts
│   ├── 03-cloud-memory.spec.ts
│   ├── 04-marketplace.spec.ts
│   └── 05-api.spec.ts
├── helpers/
│   └── test-utils.ts       # 通用测试工具
└── test-results/           # 测试结果（gitignore）
```
