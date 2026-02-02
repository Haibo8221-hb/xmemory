# xmemory E2E 测试

基于 Playwright 的端到端测试套件。

## 快速开始

```bash
# 1. 安装依赖
npm install
npx playwright install

# 2. 设置环境变量
cp tests/e2e/.env.example tests/e2e/.env
# 编辑 .env 文件，设置 TEST_SESSION_COOKIE

# 3. 运行测试
npm run test:e2e
```

## 运行方式

```bash
# 运行所有测试（有界面）
npm run test:e2e

# CI 模式（无界面，适合自动化）
npm run test:e2e:ci

# 打开 Playwright UI（调试用）
npm run test:e2e:ui

# 只运行特定测试
npm run test:e2e -- --grep "download"

# 只运行公开页面测试（无需登录）
npm run test:e2e -- --project=public

# 只运行 API 测试
npm run test:e2e -- --project=api

# 查看测试报告
npm run test:e2e:report

# 调试模式
npm run test:e2e:debug
```

或者使用脚本：

```cmd
# Windows
tests\e2e\run-tests.cmd
tests\e2e\run-tests.cmd --ci
tests\e2e\run-tests.cmd --ui
tests\e2e\run-tests.cmd --public
```

## 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `TEST_BASE_URL` | 否 | 测试目标 URL，默认 `https://xmemory.work` |
| `TEST_SESSION_COOKIE` | 是* | Supabase session cookie（需要登录测试时必需） |
| `TEST_USER_EMAIL` | 否 | 测试账号邮箱（备用认证方式） |
| `TEST_USER_PASSWORD` | 否 | 测试账号密码（备用认证方式） |

### 获取 Session Cookie

1. 打开浏览器，登录 https://xmemory.work
2. 打开开发者工具 (F12) → Application → Cookies
3. 找到 `sb-uupwzvbrcmiwkutgeqza-auth-token`
4. 复制其值到 `TEST_SESSION_COOKIE`

## 测试结构

```
tests/e2e/
├── playwright.config.ts    # Playwright 配置
├── global-setup.ts         # 全局初始化
├── global-teardown.ts      # 全局清理
├── specs/
│   ├── auth.setup.ts       # 认证设置
│   ├── 01-public-pages.spec.ts   # 公开页面测试
│   ├── 02-auth.spec.ts           # 认证流程测试
│   ├── 03-cloud-memory.spec.ts   # 云端 Memory 测试
│   ├── 04-marketplace.spec.ts    # 市场功能测试
│   └── 05-api.spec.ts            # API 测试
├── helpers/
│   └── test-utils.ts       # 测试工具函数
├── fixtures/
│   └── test-files/         # 测试用文件
└── test-results/           # 测试结果（gitignore）
```

## 测试覆盖

### 公开页面 (01)
- ✅ 首页加载
- ✅ 定价页
- ✅ 登录页
- ✅ 市场页
- ✅ Memory 详情页
- ✅ 404 页面

### 认证流程 (02)
- ✅ 未登录重定向
- ✅ Google OAuth 按钮
- ✅ redirect 参数保留

### 云端 Memory (03)
- ✅ 列表页加载
- ✅ 上传页加载
- ✅ 上传 Memory
- ✅ **下载 Memory** ⭐
- ✅ 查看历史
- ✅ 删除 Memory

### 市场功能 (04)
- ✅ 市场页加载
- ✅ Memory 详情
- ✅ 获取免费 Memory
- ✅ **下载已购买 Memory** ⭐
- ✅ 付费跳转 Stripe

### API 测试 (05)
- ✅ 认证检查
- ✅ 参数验证
- ✅ 错误响应格式

## 编写测试原则

### ❌ 错误示范

```javascript
// 不要这样写！如果按钮不存在，测试会静默通过
if (await downloadButton.isVisible()) {
  await downloadButton.click()
}
```

### ✅ 正确示范

```javascript
// 方式 1: 显式断言
await expect(downloadButton).toBeVisible({ timeout: 5000 })
await downloadButton.click()

// 方式 2: 显式跳过
if (await emptyState.isVisible()) {
  test.skip(true, '没有数据可测试')
  return
}
await expect(downloadButton).toBeVisible()
```

## CI/CD

测试会在以下情况自动运行：
- Push 到 main 分支
- 创建 Pull Request
- 手动触发

配置文件: `.github/workflows/e2e-tests.yml`

### GitHub Secrets

在仓库设置中添加：
- `TEST_SESSION_COOKIE`: 测试账号的 session cookie

## 故障排查

### 测试超时
- 检查网络连接
- 增加 timeout：`await expect(x).toBeVisible({ timeout: 10000 })`

### 认证测试被跳过
- 检查 `TEST_SESSION_COOKIE` 是否设置
- Cookie 可能已过期，重新获取

### 下载测试失败
- 检查 Supabase Storage 权限
- 检查文件是否存在

### 元素找不到
- 使用 `--ui` 模式调试
- 检查选择器是否匹配中英文
