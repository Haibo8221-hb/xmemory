-- xmemory v2.0 Cloud Features Migration
-- Run this in Supabase SQL Editor

-- 1. Cloud Memories 表 - 用户的云端 Memory 备份
CREATE TABLE IF NOT EXISTS cloud_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'gemini')),
  account_label TEXT,
  content JSONB NOT NULL,
  checksum TEXT NOT NULL,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 每个用户每个平台可以有多个账号，用 account_label 区分
  UNIQUE(user_id, platform, account_label)
);

-- 2. Memory Versions 表 - 版本历史
CREATE TABLE IF NOT EXISTS memory_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cloud_memory_id UUID NOT NULL REFERENCES cloud_memories(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  content JSONB NOT NULL,
  diff JSONB,
  created_by TEXT DEFAULT 'auto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(cloud_memory_id, version_number)
);

-- 3. User Subscriptions 表 - 用户订阅
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Teams 表 - 团队
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  plan TEXT DEFAULT 'team',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Team Members 表 - 团队成员
CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (team_id, user_id)
);

-- 6. Team Memories 表 - 团队共享 Memory
CREATE TABLE IF NOT EXISTS team_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  platform TEXT DEFAULT 'chatgpt',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 更新 profiles 表，添加订阅相关字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';

-- 索引
CREATE INDEX IF NOT EXISTS idx_cloud_memories_user ON cloud_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_memories_platform ON cloud_memories(platform);
CREATE INDEX IF NOT EXISTS idx_memory_versions_cloud_memory ON memory_versions(cloud_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_versions_created ON memory_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_memories_team ON team_memories(team_id);

-- RLS 策略
ALTER TABLE cloud_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memories ENABLE ROW LEVEL SECURITY;

-- Cloud Memories RLS
CREATE POLICY "Users can view own cloud memories" ON cloud_memories
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own cloud memories" ON cloud_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own cloud memories" ON cloud_memories
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own cloud memories" ON cloud_memories
  FOR DELETE USING (auth.uid() = user_id);

-- Memory Versions RLS
CREATE POLICY "Users can view own memory versions" ON memory_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cloud_memories 
      WHERE cloud_memories.id = memory_versions.cloud_memory_id 
      AND cloud_memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own memory versions" ON memory_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cloud_memories 
      WHERE cloud_memories.id = memory_versions.cloud_memory_id 
      AND cloud_memories.user_id = auth.uid()
    )
  );

-- User Subscriptions RLS
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Teams RLS
CREATE POLICY "Team members can view team" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Only owner can update team" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

-- Team Members RLS
CREATE POLICY "Team members can view members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid()
    )
  );

-- Team Memories RLS
CREATE POLICY "Team members can view team memories" ON team_memories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_memories.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can insert team memories" ON team_memories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_memories.team_id 
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin', 'member')
    )
  );

-- 函数：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器
DROP TRIGGER IF EXISTS update_cloud_memories_updated_at ON cloud_memories;
CREATE TRIGGER update_cloud_memories_updated_at
  BEFORE UPDATE ON cloud_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_memories_updated_at ON team_memories;
CREATE TRIGGER update_team_memories_updated_at
  BEFORE UPDATE ON team_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
