-- Create user_memories table for Memory Bank feature
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'gemini', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_path TEXT,
  notes TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own memories" ON user_memories 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON user_memories 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON user_memories 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON user_memories 
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_platform ON user_memories(platform);
