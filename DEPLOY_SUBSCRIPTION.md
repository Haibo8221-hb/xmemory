# 部署订阅功能

## Stripe 产品信息 (Test Mode)

| 产品 | Product ID | Price ID | 价格 |
|------|-----------|----------|------|
| 月付 | prod_Tu9CA7CYKPkMtL | price_1SwKu6Pj32HCeBo9OD1aumFT | $2/月 |
| 年付 | prod_Tu9EUFxtmNONvQ | price_1SwKvhPj32HCeBo9ohUYTJnG | $10/年 |

## 服务器部署步骤

1. **SSH 连接服务器**
```bash
ssh root@213.250.150.208
# 密码: Huawei123!@#
```

2. **更新环境变量**
```bash
cd /opt/xmemory
# 添加 Price ID 环境变量
echo 'STRIPE_PRO_MONTHLY_PRICE_ID=price_1SwKu6Pj32HCeBo9OD1aumFT' >> .env.local
echo 'STRIPE_PRO_ANNUAL_PRICE_ID=price_1SwKvhPj32HCeBo9ohUYTJnG' >> .env.local

# 验证
cat .env.local | grep STRIPE
```

3. **拉取最新代码并重建**
```bash
cd /opt/xmemory
git pull origin main
npm run build
pm2 restart xmemory
```

4. **验证部署**
- 访问 https://xmemory.work/pricing
- 点击 "Upgrade to Pro" 测试
- 使用测试卡号 4242 4242 4242 4242

## 本地已完成的更新

- ✅ Stripe Dashboard 创建了两个订阅产品
- ✅ 更新了 docs/STRIPE_SUBSCRIPTION_SETUP.md
- ✅ 更新了 pricing 页面价格显示
- ✅ 创建了本地 .env.local 文件
- ✅ 代码已推送到 GitHub

## 环境变量完整列表

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uupwzvbrcmiwkutgeqza.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL
NEXT_PUBLIC_APP_URL=https://xmemory.work

# Stripe (Sandbox/Test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Svog1Pj32HCeBo9MX0Adl...
STRIPE_SECRET_KEY=sk_test_51Svog1Pj32HCeBo9kp1S45xoy...
STRIPE_WEBHOOK_SECRET=whsec_IahhEhv7K1OxQqWTHu3mBHgA2nZqDD7M

# Stripe Subscription Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_1SwKu6Pj32HCeBo9OD1aumFT
STRIPE_PRO_ANNUAL_PRICE_ID=price_1SwKvhPj32HCeBo9ohUYTJnG
```
