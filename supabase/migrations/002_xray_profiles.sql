-- xmemory New Features Migration
-- Memory X-Ray, Profiles, Smart Organize

-- =====================================================
-- 1. Memory Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS memory_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🎭',
  description TEXT,
  color TEXT DEFAULT 'purple',
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_memory_profiles_user ON memory_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_profiles_active ON memory_profiles(user_id, is_active);

-- =====================================================
-- 2. Profile-Memory Junction Table
-- =====================================================
CREATE TABLE IF NOT EXISTS profile_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES memory_profiles(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL REFERENCES user_memories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, memory_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_memories_profile ON profile_memories(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_memories_memory ON profile_memories(memory_id);

-- =====================================================
-- 3. Add X-Ray fields to user_memories
-- =====================================================
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS privacy_score INTEGER DEFAULT 100;
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS privacy_issues JSONB DEFAULT '[]';
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '{}';
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS source_date TIMESTAMPTZ;
ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS last_analyzed TIMESTAMPTZ;

-- =====================================================
-- 4. Memory Analysis History (for Smart Organize)
-- =====================================================
CREATE TABLE IF NOT EXISTS memory_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- 'privacy', 'duplicate', 'conflict', 'organize'
  result JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_memory_analysis_user ON memory_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_analysis_status ON memory_analysis(user_id, status);

-- =====================================================
-- 5. RLS Policies
-- =====================================================
ALTER TABLE memory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_analysis ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own
CREATE POLICY "Users can view own profiles" ON memory_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON memory_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON memory_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles" ON memory_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Profile-Memory: Users can manage their own
CREATE POLICY "Users can view own profile_memories" ON profile_memories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM memory_profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own profile_memories" ON profile_memories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memory_profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own profile_memories" ON profile_memories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM memory_profiles WHERE id = profile_id AND user_id = auth.uid())
  );

-- Analysis: Users can only access their own
CREATE POLICY "Users can view own analysis" ON memory_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis" ON memory_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis" ON memory_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function to set active profile (and deactivate others)
CREATE OR REPLACE FUNCTION set_active_profile(profile_id UUID)
RETURNS void AS $$
BEGIN
  -- Deactivate all profiles for this user
  UPDATE memory_profiles 
  SET is_active = FALSE 
  WHERE user_id = auth.uid();
  
  -- Activate the selected profile
  UPDATE memory_profiles 
  SET is_active = TRUE 
  WHERE id = profile_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default profiles for new users
CREATE OR REPLACE FUNCTION create_default_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default profiles
  INSERT INTO memory_profiles (user_id, name, icon, description, color, is_default)
  VALUES 
    (NEW.id, 'Work', '🏢', 'Professional context', 'blue', true),
    (NEW.id, 'Personal', '🏠', 'Personal life', 'green', false),
    (NEW.id, 'Learning', '📚', 'Study and learning', 'purple', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default profiles on user signup
DROP TRIGGER IF EXISTS on_user_created_profiles ON profiles;
CREATE TRIGGER on_user_created_profiles
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_profiles();
