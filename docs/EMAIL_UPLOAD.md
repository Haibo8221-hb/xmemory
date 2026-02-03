# xmemory 邮件上传功能

用户可以通过发送邮件到 `upload@xmemory.work` 来上传内容。

## 使用方法

### 1. 上传附件
```
收件人: upload@xmemory.work
主题: 我的ChatGPT记忆备份
附件: memory.json (或 .txt, .md, .skill 等)
```

### 2. 直接发送文本
```
收件人: upload@xmemory.work
主题: React开发助手技能
正文: [直接粘贴Memory/Skill内容]
```

## 注意事项
- 发件邮箱必须与 xmemory.work 注册邮箱一致
- 上传的内容默认为 **草稿** 状态，需要到网站确认发布
- 支持格式: .json, .txt, .md, .skill, .yaml

---

# Cloudflare 设置步骤

## 1. 启用 Email Routing

1. 登录 Cloudflare Dashboard
2. 选择 xmemory.work 域名
3. 进入 **Email** > **Email Routing**
4. 点击 **Enable Email Routing**
5. 按提示添加所需的 DNS 记录

## 2. 创建 Email Worker

1. 进入 **Workers & Pages**
2. 创建新 Worker，名称: `xmemory-email`
3. 粘贴 `cloudflare/email-worker.js` 代码
4. 添加环境变量:
   - `EMAIL_UPLOAD_SECRET`: 与服务器一致的密钥

## 3. 配置 Email 路由规则

1. 回到 **Email** > **Email Routing** > **Routing rules**
2. 创建新规则:
   - **Custom address**: `upload`
   - **Action**: Send to Worker
   - **Destination**: `xmemory-email`

## 4. 服务器配置

在 xmemory 服务器的 `.env` 文件中添加:
```
EMAIL_UPLOAD_SECRET=xmemory-email-upload-2026
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
```

---

# API 端点

## POST /api/email-upload

接收来自 Cloudflare Email Worker 的请求。

### Headers
```
Authorization: Bearer {EMAIL_UPLOAD_SECRET}
Content-Type: application/json
```

### Body
```json
{
  "from": "user@example.com",
  "subject": "My Memory Backup",
  "text": "email body text",
  "attachments": [
    {
      "filename": "memory.json",
      "content": "base64_encoded_content",
      "contentType": "application/json"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Content uploaded successfully",
  "memory": {
    "id": "uuid",
    "title": "My Memory Backup",
    "contentType": "memory",
    "status": "draft"
  }
}
```
