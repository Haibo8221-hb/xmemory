# Stripe Pro 订阅配置指南

## 1. 在 Stripe Dashboard 创建产品

登录 [Stripe Dashboard](https://dashboard.stripe.com) → Products → Add Product

### Pro Monthly (月付)
- **Name**: xmemory Pro Monthly
- **Price**: $2/month
- **Billing period**: Monthly
- **Product ID**: `prod_Tu9CA7CYKPkMtL` (Test)
- **Price ID**: `price_1SwKu6Pj32HCeBo9OD1aumFT` (Test)

### Pro Annual (年付)
- **Name**: xmemory Pro Annual
- **Price**: $10/year (Save 17% - $0.83/month)
- **Billing period**: Yearly
- **Product ID**: `prod_Tu9EUFxtmNONvQ` (Test)
- **Price ID**: `price_1SwKvhPj32HCeBo9ohUYTJnG` (Test)

## 2. 配置环境变量

在 Vercel Dashboard → Settings → Environment Variables 添加:

```
# Test Mode
STRIPE_PRO_MONTHLY_PRICE_ID=price_1SwKu6Pj32HCeBo9OD1aumFT
STRIPE_PRO_ANNUAL_PRICE_ID=price_1SwKvhPj32HCeBo9ohUYTJnG
```

## 3. 配置 Webhook

在 Stripe Dashboard → Developers → Webhooks → Add endpoint

- **Endpoint URL**: `https://xmemory.work/api/webhook/stripe`
- **Events to send**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

## 4. 数据库表 (如果还没创建)

```sql
-- 用户订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro'
  billing TEXT, -- 'monthly', 'annual'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
```

## 5. 测试

1. 在测试模式下创建产品和价格
2. 使用测试卡号: `4242 4242 4242 4242`
3. 确认订阅创建成功
4. 切换到生产模式时更新 Price ID
