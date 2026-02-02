# xmemory PRD v2.0
## AI Memory 管理工具

> 产品：xmemory.work  
> 定位：AI Memory 的 Notion  
> 版本：v2.0 (工具优先)  
> 日期：2026-02-02  

---

## 1. 产品定位

### 1.1 一句话描述

**导入、整理、组合、导出你的 AI 记忆**

### 1.2 目标用户

| 用户类型 | 特征 | 痛点 |
|----------|------|------|
| 重度 AI 用户 | 每天用 ChatGPT/Claude | Memory 乱、找不到、跨平台麻烦 |
| 知识工作者 | 用 AI 辅助写作/开发/研究 | 不同场景需要不同 AI "人设" |
| AI 玩家 | 喜欢调教 AI、研究 Prompt | 想管理和分享自己的调教成果 |

### 1.3 核心价值

| 现状痛点 | xmemory 解决方案 |
|----------|------------------|
| ChatGPT Memory 是一坨，无法分类 | Skill 分组管理 |
| 不知道 AI 记住了什么垃圾 | 可视化、可编辑 |
| 换设备/清缓存就没了 | 云端永久保存 |
| 想在 Claude 用同样的设定 | 跨平台导出格式 |
| 工作和生活场景混在一起 | Profile 场景切换 |

---

## 2. 产品架构

```
┌─────────────────────────────────────────────────────────────┐
│                        xmemory                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   导入      │ →  │   整理      │ →  │   导出      │     │
│  │  Import     │    │  Organize   │    │  Export     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│        ↓                  ↓                  ↓              │
│   JSON/文本         Skills/Tags         多平台格式          │
│                          ↓                                  │
│                   ┌─────────────┐                          │
│                   │  Profiles   │                          │
│                   │  场景组合    │                          │
│                   └─────────────┘                          │
│                          ↓                                  │
│              ┌─────────────────────┐                       │
│              │    云端同步/分享     │  ← Phase 2           │
│              └─────────────────────┘                       │
│                          ↓                                  │
│              ┌─────────────────────┐                       │
│              │    交易市场         │  ← Phase 3           │
│              └─────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 信息架构

### 3.1 核心概念

```
User
 └── Memory Bank (用户的记忆库)
      ├── Memories (原始记忆条目)
      │    ├── memory_1: "用户是Python开发者"
      │    ├── memory_2: "偏好简洁的代码风格"
      │    └── memory_3: "用中文回复"
      │
      ├── Skills (分组后的记忆)
      │    ├── skill_1: "Python开发" → [memory_1, memory_2]
      │    └── skill_2: "通用偏好" → [memory_3]
      │
      └── Profiles (场景组合)
           ├── profile_1: "工作模式" → [skill_1, skill_2]
           └── profile_2: "学习模式" → [skill_2]
```

### 3.2 数据模型

```typescript
// 单条记忆
interface Memory {
  id: string;
  content: string;           // 记忆内容
  source: 'chatgpt' | 'claude' | 'manual';
  importedAt: Date;
  tags: string[];
  skillId?: string;          // 所属 Skill
}

// 技能分组
interface Skill {
  id: string;
  name: string;              // "Python开发"
  description?: string;
  icon?: string;             // emoji
  memoryIds: string[];       // 包含的记忆
  createdAt: Date;
  updatedAt: Date;
}

// 场景配置
interface Profile {
  id: string;
  name: string;              // "工作模式"
  description?: string;
  skillIds: string[];        // 包含的技能（有序）
  targetPlatform: 'chatgpt' | 'claude' | 'universal';
  createdAt: Date;
  updatedAt: Date;
  lastExportedAt?: Date;
}

// 用户
interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  memoryCount: number;
  skillCount: number;
  profileCount: number;
}
```

---

## 4. 功能详述

### 4.1 导入 (Import)

#### 4.1.1 支持的导入方式

| 方式 | 描述 | 优先级 |
|------|------|--------|
| ChatGPT JSON | 上传导出的 JSON 文件 | P0 |
| 粘贴文本 | 直接粘贴，智能解析 | P0 |
| Claude 导出 | (待 Claude 支持) | P2 |
| 手动添加 | 逐条输入 | P1 |

#### 4.1.2 导入流程

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📥 导入你的 AI 记忆                                        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │          拖拽 JSON 文件到这里                        │   │
│   │               或点击上传                            │   │
│   │                                                     │   │
│   │   ─────────────── 或 ───────────────                │   │
│   │                                                     │   │
│   │          [ 粘贴文本导入 ]                           │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   💡 如何导出 ChatGPT Memory？ [查看教程]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.3 导入预览 & 去重

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📋 导入预览                                  [取消] [导入] │
│                                                             │
│   发现 47 条记忆，其中：                                     │
│   • 🆕 新增: 42 条                                          │
│   • 🔄 重复: 5 条 (已自动跳过)                               │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ ☑️ 用户是一名Python开发者，有5年经验                  │   │
│   │ ☑️ 偏好使用Type Hints                                │   │
│   │ ☑️ 代码风格偏好PEP8规范                              │   │
│   │ ☐ 用户住在上海 ← 可能是隐私信息                      │   │
│   │ ☑️ 喜欢简洁的回复风格                                │   │
│   │ ...                                                 │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ⚠️ 检测到可能的隐私信息，建议取消勾选后再导入              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2 整理 (Organize)

#### 4.2.1 Memory Bank 主界面

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 xmemory                              [导入] Sam ▼       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌────────────────────────────────────────┐  │
│  │          │  │                                        │  │
│  │ 📁 Skills │  │  🐍 Python 开发                [编辑]  │  │
│  │          │  │                                        │  │
│  │ 🐍 Python │  │  12 条记忆                            │  │
│  │ ✍️ 写作   │  │                                        │  │
│  │ 📧 邮件   │  │  ┌────────────────────────────────┐   │  │
│  │ 💬 通用   │  │  │ • 用户是Python开发者，5年经验   │   │  │
│  │          │  │  │ • 偏好PEP8规范                  │   │  │
│  │ ──────── │  │  │ • 使用Type Hints               │   │  │
│  │          │  │  │ • 喜欢函数式编程风格            │   │  │
│  │ 📋 全部   │  │  │ • ...                          │   │  │
│  │ 🏷️ 未分类 │  │  └────────────────────────────────┘   │  │
│  │          │  │                                        │  │
│  │ ──────── │  │  [ + 添加记忆 ]                        │  │
│  │          │  │                                        │  │
│  │ 🎭 Profiles│ │                                        │  │
│  │          │  │                                        │  │
│  │ 💼 工作   │  └────────────────────────────────────────┘  │
│  │ 📚 学习   │                                              │
│  │          │                                              │
│  │ [+新建]  │                                              │
│  │          │  │
│  └──────────┘                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.2 Skill 编辑

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ✏️ 编辑 Skill                               [删除] [保存]  │
│                                                             │
│  图标  名称                                                 │
│  [🐍]  [Python 开发_____________]                          │
│                                                             │
│  描述                                                       │
│  [Python编程相关的偏好和专业知识_______________________]    │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  📝 记忆条目 (12)                          [+ 添加] [排序]  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ≡  用户是Python开发者，有5年经验          [✏️] [🗑️] │   │
│  │ ≡  偏好PEP8代码规范                       [✏️] [🗑️] │   │
│  │ ≡  使用Type Hints进行类型标注             [✏️] [🗑️] │   │
│  │ ≡  喜欢函数式编程风格                     [✏️] [🗑️] │   │
│  │ ≡  常用框架：FastAPI, SQLAlchemy         [✏️] [🗑️] │   │
│  │ ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💡 拖拽调整顺序，靠前的记忆优先级更高                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.3 批量整理

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🏷️ 未分类 (23条)                              [AI 自动分类] │
│                                                             │
│  ☑️ 全选                              [移动到...▼] [删除]   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑️ 用户喜欢喝美式咖啡                               │   │
│  │ ☑️ 用户的猫叫小橘                                   │   │
│  │ ☐ 用户在写一本关于AI的书                           │   │
│  │ ☑️ 回复保持简洁，不要太啰嗦                         │   │
│  │ ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  🤖 AI 分类建议（点击采纳）                                  │
│                                                             │
│  "用户喜欢喝美式咖啡" → 💬 生活偏好 [采纳]                  │
│  "回复保持简洁" → 💬 通用偏好 [采纳]                        │
│  "用户在写AI书" → ✍️ 写作项目 [采纳]                        │
│                                                             │
│                               [全部采纳]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.3 Profile (场景组合)

#### 4.3.1 Profile 概念

**Profile = 针对特定场景的 Skill 组合**

示例：
- 「工作模式」= Python开发 + 技术写作 + 邮件沟通
- 「学习模式」= 通用偏好 + 学习方法
- 「创作模式」= 写作风格 + 创意思维

#### 4.3.2 创建 Profile

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ➕ 新建 Profile                                            │
│                                                             │
│  名称                                                       │
│  [工作模式___________________]                              │
│                                                             │
│  描述（可选）                                               │
│  [日常开发和工作沟通__________]                             │
│                                                             │
│  目标平台                                                   │
│  (●) ChatGPT  ( ) Claude  ( ) 通用                         │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  选择要包含的 Skills:                                       │
│                                                             │
│  ☑️ 🐍 Python开发 (12条)                                   │
│  ☑️ 📝 技术写作 (8条)                                      │
│  ☑️ 📧 邮件沟通 (5条)                                      │
│  ☐ ✍️ 创意写作 (15条)                                      │
│  ☑️ 💬 通用偏好 (6条)                                      │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  📊 统计：4 个 Skills，共 31 条记忆                         │
│                                                             │
│                              [取消]  [创建]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.4 导出 (Export)

#### 4.4.1 导出选项

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📤 导出: 工作模式                                          │
│                                                             │
│  包含 4 个 Skills，共 31 条记忆                             │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  导出格式:                                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📋 复制文本                              [推荐]      │   │
│  │    直接粘贴给 AI，让它记住                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📄 下载 JSON                                        │   │
│  │    ChatGPT 原始格式，可备份                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔗 生成分享链接                          [Pro]      │   │
│  │    分享给朋友，一键导入                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.4.2 复制文本格式

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📋 复制以下内容，发送给你的 AI:                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  请记住以下关于我的信息：                            │   │
│  │                                                     │   │
│  │  ## Python 开发                                     │   │
│  │  - 我是Python开发者，有5年经验                       │   │
│  │  - 我偏好PEP8代码规范                               │   │
│  │  - 我使用Type Hints进行类型标注                     │   │
│  │  - 我喜欢函数式编程风格                             │   │
│  │                                                     │   │
│  │  ## 技术写作                                        │   │
│  │  - 文档要清晰、有层次                               │   │
│  │  - 代码示例要可运行                                 │   │
│  │                                                     │   │
│  │  ## 通用偏好                                        │   │
│  │  - 用中文回复                                       │   │
│  │  - 保持简洁，不要啰嗦                               │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    [ 📋 复制到剪贴板 ]                       │
│                                                             │
│  ✅ 已复制！现在去 ChatGPT 粘贴吧                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 页面结构

### 5.1 页面列表

| 页面 | 路由 | 描述 | 登录要求 |
|------|------|------|----------|
| 首页 | `/` | 产品介绍 + CTA | 否 |
| 登录 | `/login` | 登录/注册 | 否 |
| Memory Bank | `/bank` | 主工作区 | 是 |
| 导入 | `/import` | 导入向导 | 是 |
| Skill 详情 | `/skill/[id]` | 编辑 Skill | 是 |
| Profile 详情 | `/profile/[id]` | 编辑 Profile | 是 |
| 导出 | `/export/[id]` | 导出向导 | 是 |
| 设置 | `/settings` | 账户设置 | 是 |
| 文档 | `/docs/*` | 帮助文档 | 否 |

### 5.2 导航结构

```
Header (固定):
├── Logo (→ 首页)
├── [登录后] Memory Bank | 文档
└── [登录后] 用户头像 ▼
     ├── 设置
     └── 退出

Sidebar (Memory Bank 内):
├── Skills
│    ├── [用户创建的 Skills]
│    ├── ──────
│    ├── 📋 全部
│    ├── 🏷️ 未分类
│    └── [+ 新建 Skill]
├── ──────
├── Profiles
│    ├── [用户创建的 Profiles]
│    └── [+ 新建 Profile]
└── ──────
     └── [导入]
```

---

## 6. 用户旅程

### 6.1 新用户首次使用

```
首页 → 注册/登录 → 导入向导 → Memory Bank
     
1. 看到产品价值，点击"开始使用"
2. 用 Google/邮箱 注册
3. 进入导入向导
   - 选择"上传 ChatGPT JSON"
   - 预览 & 确认导入
4. 进入 Memory Bank
   - 看到所有导入的记忆（未分类）
   - 引导创建第一个 Skill
5. 创建 Profile 并导出
```

### 6.2 日常使用

```
登录 → Memory Bank → 整理/导出

场景A: 整理新记忆
1. 导入最新的 ChatGPT Memory
2. 查看"未分类"
3. 拖拽分配到对应 Skill

场景B: 切换工作场景
1. 选择"工作模式" Profile
2. 点击导出
3. 复制文本，粘贴给 ChatGPT

场景C: 创建新 Skill
1. 点击"新建 Skill"
2. 命名 + 添加记忆
3. 加入到 Profile
```

---

## 7. 技术方案

### 7.1 技术栈

| 层 | 技术选型 | 理由 |
|----|----------|------|
| 前端 | Next.js 14 + TypeScript | SSR + App Router |
| 样式 | Tailwind + shadcn/ui | 快速开发 |
| 状态 | Zustand | 轻量 |
| 后端 | Next.js API Routes | 全栈统一 |
| 数据库 | Supabase (PostgreSQL) | Auth + DB + 实时 |
| 存储 | Supabase Storage | 用户上传的文件 |
| 部署 | Vercel | 自动部署 |
| 分析 | Posthog | 产品分析 |

### 7.2 数据库 Schema

```sql
-- 用户表 (Supabase Auth 自动创建)
-- auth.users

-- 用户扩展信息
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 记忆表
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual', -- 'chatgpt' | 'claude' | 'manual'
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill 表
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile 表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  skill_ids UUID[],
  target_platform TEXT DEFAULT 'chatgpt',
  last_exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 导出历史
CREATE TABLE export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  format TEXT, -- 'text' | 'json'
  memory_count INT,
  exported_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own memories" ON memories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own skills" ON skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own profiles" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);
```

### 7.3 API 设计

```
# 认证 (Supabase Auth)
POST   /auth/signup
POST   /auth/login
POST   /auth/logout

# Memories
GET    /api/memories              # 列表（支持 skillId 筛选）
POST   /api/memories              # 创建
POST   /api/memories/import       # 批量导入
PUT    /api/memories/:id          # 更新
DELETE /api/memories/:id          # 删除
POST   /api/memories/batch-move   # 批量移动到 Skill

# Skills
GET    /api/skills                # 列表
POST   /api/skills                # 创建
PUT    /api/skills/:id            # 更新
DELETE /api/skills/:id            # 删除
PUT    /api/skills/reorder        # 调整顺序

# Profiles
GET    /api/profiles              # 列表
POST   /api/profiles              # 创建
PUT    /api/profiles/:id          # 更新
DELETE /api/profiles/:id          # 删除
POST   /api/profiles/:id/export   # 导出（生成文本/JSON）

# AI 辅助
POST   /api/ai/categorize         # AI 自动分类建议
POST   /api/ai/detect-pii         # 检测隐私信息
```

---

## 8. 商业模式

### 8.1 免费版 vs Pro

| 功能 | 免费 | Pro ($5/月) |
|------|------|-------------|
| 记忆条数 | 100 | 无限 |
| Skills 数量 | 5 | 无限 |
| Profiles 数量 | 2 | 无限 |
| 导出格式 | 复制文本 | + JSON + 分享链接 |
| AI 自动分类 | 5次/月 | 无限 |
| 云端同步 | ✓ | ✓ |
| 版本历史 | 7天 | 无限 |

### 8.2 未来变现

- **Phase 2**: 分享链接 (Pro 功能)
- **Phase 3**: 交易市场 (20% 抽成)
- **Phase 4**: 团队版 / 企业版

---

## 9. 开发计划

### Phase 1: MVP (3周)

**Week 1: 基础框架**
- [ ] 项目初始化 (Next.js + Supabase)
- [ ] 用户认证 (登录/注册)
- [ ] 数据库 Schema
- [ ] Memory Bank 主页面框架

**Week 2: 核心功能**
- [ ] 导入功能 (JSON + 文本)
- [ ] Memory CRUD
- [ ] Skill CRUD
- [ ] 拖拽分配记忆到 Skill

**Week 3: 导出 & 打磨**
- [ ] Profile CRUD
- [ ] 导出功能 (复制文本 + JSON)
- [ ] 首页 Landing Page
- [ ] 帮助文档

### Phase 2: 增强 (2周)

- [ ] AI 自动分类
- [ ] 隐私信息检测
- [ ] 分享链接功能
- [ ] 深色模式
- [ ] 移动端适配

### Phase 3: 增长 (持续)

- [ ] SEO 优化
- [ ] 产品分析
- [ ] 用户反馈收集
- [ ] 准备交易市场

---

## 10. 成功指标

### 10.1 MVP 阶段 (Month 1)

| 指标 | 目标 |
|------|------|
| 注册用户 | 500 |
| 周活用户 (WAU) | 100 |
| 导入成功率 | >80% |
| 功能完成度 | 100% MVP |

### 10.2 增长阶段 (Month 2-3)

| 指标 | 目标 |
|------|------|
| 注册用户 | 3,000 |
| 周活用户 | 500 |
| Pro 转化率 | >3% |
| NPS | >40 |

---

## 11. 风险 & 缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 用户觉得"不需要" | 中 | 高 | 强化痛点教育，展示使用前后对比 |
| ChatGPT 导出格式变化 | 低 | 中 | 模块化解析器，快速适配 |
| 用户隐私顾虑 | 中 | 中 | 端到端加密，隐私检测提醒 |
| 竞品出现 | 中 | 中 | 快速迭代，建立用户忠诚度 |

---

## 12. 附录

### 12.1 ChatGPT Memory JSON 格式

```json
{
  "memories": [
    {
      "id": "mem_xxx",
      "content": "用户是一名Python开发者",
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "mem_yyy", 
      "content": "偏好简洁的代码风格",
      "created_at": "2026-01-16T14:20:00Z"
    }
  ]
}
```

### 12.2 竞品参考

| 产品 | 定位 | 可借鉴 |
|------|------|--------|
| Notion | 知识管理 | 信息架构、拖拽交互 |
| Raindrop.io | 书签管理 | 分类 + 标签系统 |
| 1Password | 密码管理 | 敏感信息处理 |

---

*Document Version: 2.0*  
*Last Updated: 2026-02-02*
