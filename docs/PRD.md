# xmemory - 产品需求文档 (PRD)

> AI记忆交易市场 - 让用户自由交换AI的调教成果

## 1. 产品概述

### 1.1 产品定位
xmemory 是一个C2C平台，让用户可以买卖/交换他们在各AI平台（ChatGPT、Claude等）积累的Memory（记忆/上下文/人设配置）。

### 1.2 核心价值
- **对买家**：跳过AI冷启动期，获得"开箱即用"的专业化AI助手
- **对卖家**：将调教AI的时间成本变现
- **对平台**：交易抽佣

### 1.3 目标用户
- **卖家**：在特定领域深度使用AI的专业人士（程序员、设计师、作家、研究者等）
- **买家**：想快速获得专业化AI体验的新手或跨领域用户

---

## 2. MVP范围

### 2.1 支持平台（Phase 1）
- ✅ ChatGPT Memory（JSON导出/导入）
- ⏳ Claude Projects（Phase 2）
- ⏳ Gemini（Phase 3）

### 2.2 核心功能

#### 用户系统
- 邮箱注册/登录
- 用户Profile（头像、简介、擅长领域）
- 卖家/买家双重身份

#### 上传发布
- 上传Memory文件（JSON/TXT）
- 填写标题、描述、分类标签
- 设置价格（最低$0.99，支持免费）
- 隐私确认勾选（用户协议）
- 预览功能（脱敏展示部分内容）

#### 市场浏览
- 分类筛选（编程、写作、设计、学习、生活...）
- 搜索（标题、描述、标签）
- 排序（最新、最热、价格）
- Memory详情页（描述、评分、评论、示例对话）

#### 交易系统
- 购买流程（Stripe支付）
- 下载已购Memory
- 订单历史

#### 评价系统
- 购买后评分（1-5星）
- 文字评论
- 卖家回复

### 2.3 暂不做（MVP后考虑）
- 订阅制
- Memory版本管理
- AI自动优化/清洗Memory
- 社交功能（关注、私信）
- 移动App

---

## 3. 用户流程

### 3.1 卖家流程
```
注册 → 上传Memory文件 → 填写信息/定价 → 确认隐私协议 → 发布
                                    ↓
                            买家购买 → 收到款项（扣除平台抽佣）
```

### 3.2 买家流程
```
浏览市场 → 查看详情 → 购买支付 → 下载Memory文件 → 导入AI平台
```

---

## 4. 商业模式

### 4.1 收入来源
- **交易抽佣**：每笔交易抽取 20%
- **未来可选**：卖家推广费、会员订阅

### 4.2 定价策略
- 最低价格：$0.99（或免费）
- 无最高限制
- 卖家自主定价

---

## 5. 技术方案

### 5.1 技术栈
| 层级 | 选型 | 理由 |
|------|------|------|
| 前端 | Next.js 14 (App Router) | React生态、SSR、部署方便 |
| 样式 | Tailwind CSS + shadcn/ui | 快速开发、美观 |
| 后端 | Next.js API Routes | 简单、不用分离部署 |
| 数据库 | Supabase (PostgreSQL) | 免费开始、Auth内置、实时订阅 |
| 文件存储 | Supabase Storage | 统一平台 |
| 支付 | Stripe | 行业标准、Connect支持分账 |
| 部署 | Vercel | Next.js原生支持 |

### 5.2 数据模型

```sql
-- 用户表（Supabase Auth扩展）
profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  stripe_account_id TEXT,  -- Stripe Connect账户
  created_at TIMESTAMP
)

-- Memory商品表
memories (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  price DECIMAL(10,2),
  file_path TEXT,           -- Supabase Storage路径
  preview_content TEXT,     -- 脱敏预览
  platform TEXT,            -- 'chatgpt' | 'claude' | 'gemini'
  download_count INT DEFAULT 0,
  rating_avg DECIMAL(3,2),
  rating_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',  -- 'active' | 'draft' | 'removed'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 订单表
orders (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  memory_id UUID REFERENCES memories(id),
  amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  seller_amount DECIMAL(10,2),
  stripe_payment_id TEXT,
  status TEXT,  -- 'pending' | 'completed' | 'refunded'
  created_at TIMESTAMP
)

-- 评价表
reviews (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES profiles(id),
  memory_id UUID REFERENCES memories(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  seller_reply TEXT,
  created_at TIMESTAMP
)
```

### 5.3 API端点

```
POST   /api/auth/register     - 注册
POST   /api/auth/login        - 登录

GET    /api/memories          - 获取Memory列表（支持筛选、搜索、分页）
GET    /api/memories/:id      - 获取Memory详情
POST   /api/memories          - 创建Memory（需登录）
PUT    /api/memories/:id      - 更新Memory（仅卖家）
DELETE /api/memories/:id      - 删除Memory（仅卖家）

POST   /api/orders            - 创建订单/支付
GET    /api/orders            - 获取我的订单
GET    /api/orders/:id        - 订单详情
GET    /api/orders/:id/download - 下载Memory文件

POST   /api/reviews           - 提交评价
GET    /api/reviews/:memoryId - 获取评价列表

POST   /api/stripe/connect    - 创建Stripe Connect账户
POST   /api/stripe/webhook    - Stripe Webhook
```

---

## 6. 页面结构

```
/                       - 首页（热门Memory、分类入口）
/explore                - 浏览市场
/memory/[id]            - Memory详情页
/upload                 - 上传Memory（需登录）
/dashboard              - 用户中心
  /dashboard/purchases  - 我买的
  /dashboard/sales      - 我卖的
  /dashboard/settings   - 设置
/auth/login             - 登录
/auth/register          - 注册
```

---

## 7. 法律与合规

### 7.1 用户协议要点
- 用户对上传内容负全责
- 用户确认已清除敏感个人信息
- 平台不审核内容，仅提供交易服务
- 侵权投诉处理流程（DMCA）

### 7.2 隐私政策
- 明确收集的数据类型
- 数据使用目的
- 第三方分享（Stripe）

---

## 8. MVP里程碑

### Phase 1: 基础框架（Week 1）
- [x] 项目初始化
- [ ] Supabase配置
- [ ] 用户认证
- [ ] 基础UI框架

### Phase 2: 核心功能（Week 2-3）
- [ ] Memory上传/发布
- [ ] 市场浏览/搜索
- [ ] Memory详情页

### Phase 3: 交易系统（Week 4）
- [ ] Stripe集成
- [ ] 购买流程
- [ ] 下载功能

### Phase 4: 完善（Week 5）
- [ ] 评价系统
- [ ] 用户中心
- [ ] 测试/修复

### Phase 5: 上线（Week 6）
- [ ] 部署到Vercel
- [ ] 域名配置
- [ ] 内测邀请

---

## 9. 成功指标

### MVP阶段
- 上线后1个月内有 **100+** 注册用户
- 至少 **50** 个Memory上架
- 完成 **10+** 笔真实交易

### 后续目标
- 月活用户 1000+
- 月交易额 $1000+
- 用户留存率 > 30%

---

## 10. 风险与应对

| 风险 | 应对 |
|------|------|
| 无人上传内容 | 自己先上传一批示例Memory，邀请KOL入驻 |
| 无人购买 | 初期设置免费/低价Memory引流 |
| 隐私泄露事件 | 用户协议免责+快速下架机制 |
| AI平台封锁导入 | 提供手动导入教程，技术上无法完全封锁 |

---

*文档版本: v1.0*
*最后更新: 2025-02-01*
