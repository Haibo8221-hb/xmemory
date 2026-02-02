# xmemory.work 端到端测试清单

## 1. 认证流程 (Auth)

### 1.1 Google OAuth 登录
- [ ] 点击 "Continue with Google" 跳转到 Google 登录
- [ ] Google 授权后跳转回 xmemory.work
- [ ] 登录成功后重定向到 /dashboard
- [ ] Session cookie 正确设置（检查 sb-*-auth-token）
- [ ] 刷新页面后保持登录状态

### 1.2 登出
- [ ] 点击登出按钮
- [ ] Session 被清除
- [ ] 重定向到首页或登录页

### 1.3 未登录保护
- [ ] 访问 /dashboard 被重定向到登录页
- [ ] 访问 /dashboard/cloud 被重定向到登录页
- [ ] API 调用返回 401

---

## 2. Cloud Memory 功能

### 2.1 上传 Memory
- [ ] 上传页面正常加载 (/dashboard/cloud/upload)
- [ ] 选择平台 (ChatGPT/Claude/Other)
- [ ] 上传 JSON 文件成功
- [ ] 显示上传成功提示
- [ ] 重定向到 Cloud 列表页

### 2.2 Memory 列表
- [ ] 列表页正常加载 (/dashboard/cloud)
- [ ] 显示已上传的 Memory
- [ ] 显示平台图标
- [ ] 显示账号标签
- [ ] 显示条目数量
- [ ] 显示最后同步时间

### 2.3 Memory 下载
- [ ] 点击下载按钮
- [ ] 浏览器开始下载文件
- [ ] 文件名格式正确 (platform-memory-label.json)
- [ ] 文件内容完整（与上传内容一致）

### 2.4 Memory 删除
- [ ] 点击删除按钮显示确认弹窗
- [ ] 确认后成功删除
- [ ] 从列表中移除

### 2.5 版本历史
- [ ] 点击 "History" 进入版本历史页
- [ ] 显示版本列表
- [ ] 显示版本差异摘要
- [ ] 下载特定版本
- [ ] 恢复到特定版本

---

## 3. Memory Bank 功能

### 3.1 创建 Memory Bank
- [ ] Memory Bank 页面加载 (/dashboard/memory-bank)
- [ ] 创建新的 Bank
- [ ] 添加条目
- [ ] 保存成功

### 3.2 管理条目
- [ ] 编辑条目
- [ ] 删除条目
- [ ] 搜索条目

---

## 4. X-Ray 分析

### 4.1 分析功能
- [ ] X-Ray 页面加载 (/dashboard/xray)
- [ ] 选择 Memory 进行分析
- [ ] 显示分析结果
- [ ] 显示标签云/分类

---

## 5. 个人资料

### 5.1 Profile 页面
- [ ] 个人资料页加载 (/dashboard/profiles)
- [ ] 显示用户信息
- [ ] 编辑个人资料

---

## 6. 订阅与支付

### 6.1 价格页
- [ ] 价格页加载 (/pricing)
- [ ] 显示所有计划
- [ ] Free/Pro/Team 对比

### 6.2 Checkout
- [ ] 点击升级按钮
- [ ] 跳转到 Stripe Checkout
- [ ] 支付成功后回调处理

---

## 7. 公共页面

### 7.1 首页
- [ ] 首页加载 (/)
- [ ] 显示产品介绍
- [ ] CTA 按钮可点击

### 7.2 文档页
- [ ] /docs/import 加载
- [ ] /docs/export 加载
- [ ] /docs/faq 加载

### 7.3 法律页面
- [ ] /privacy 加载
- [ ] /terms 加载

---

## 8. 多语言支持

### 8.1 语言切换
- [ ] 检测浏览器语言
- [ ] 中文界面正常
- [ ] 英文界面正常
- [ ] 切换语言后保持

---

## 9. 响应式设计

### 9.1 移动端
- [ ] 首页移动端布局
- [ ] Dashboard 移动端导航
- [ ] 表格在移动端可滚动

### 9.2 平板
- [ ] 中等屏幕布局适配

---

## 10. 错误处理

### 10.1 API 错误
- [ ] 网络错误显示友好提示
- [ ] 服务器错误显示错误信息
- [ ] 401 错误重定向到登录

### 10.2 404 页面
- [ ] 访问不存在的页面显示 404

---

## 测试数据

### 示例 ChatGPT Memory JSON
```json
[
  {
    "id": "test-1",
    "key": "User Preference",
    "value": "Prefers concise responses",
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": "test-2", 
    "key": "Name",
    "value": "Test User",
    "created_at": "2024-01-02T00:00:00Z"
  }
]
```

### 示例 Claude Memory JSON
```json
{
  "memories": [
    {
      "id": "claude-1",
      "key": "Project Context",
      "value": "Working on xmemory project"
    }
  ],
  "metadata": {
    "exported_at": "2024-01-01T00:00:00Z"
  }
}
```
