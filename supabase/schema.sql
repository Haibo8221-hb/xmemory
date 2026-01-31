-- xmemory Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories table (the products)
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  file_path TEXT NOT NULL,
  preview_content TEXT,
  platform TEXT NOT NULL DEFAULT 'chatgpt',
  download_count INT DEFAULT 0,
  rating_avg DECIMAL(3, 2),
  rating_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_platform CHECK (platform IN ('chatgpt', 'claude', 'gemini')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'draft', 'removed')),
  CONSTRAINT valid_price CHECK (price >= 0)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  seller_amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'completed', 'refunded'))
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  rating INT NOT NULL,
  comment TEXT,
  seller_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Indexes for performance
CREATE INDEX idx_memories_seller ON memories(seller_id);
CREATE INDEX idx_memories_category ON memories(category);
CREATE INDEX idx_memories_platform ON memories(platform);
CREATE INDEX idx_memories_status ON memories(status);
CREATE INDEX idx_memories_created ON memories(created_at DESC);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_memory ON orders(memory_id);
CREATE INDEX idx_reviews_memory ON reviews(memory_id);

-- Full text search on memories
CREATE INDEX idx_memories_search ON memories USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update memory rating when review is added
CREATE OR REPLACE FUNCTION update_memory_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE memories
  SET 
    rating_avg = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE memory_id = NEW.memory_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE memory_id = NEW.memory_id)
  WHERE id = NEW.memory_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating on new review
CREATE OR REPLACE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_memory_rating();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Memories: Public read active, seller write
CREATE POLICY "Active memories are viewable by everyone" ON memories
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can insert own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own memories" ON memories
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own memories" ON memories
  FOR DELETE USING (auth.uid() = seller_id);

-- Orders: Own read/write
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() IN (
    SELECT seller_id FROM memories WHERE id = memory_id
  ));

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Reviews: Public read, buyer write
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can reply to reviews" ON reviews
  FOR UPDATE USING (auth.uid() IN (
    SELECT seller_id FROM memories WHERE id = memory_id
  ));

-- Storage bucket for memory files
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload memory files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Buyers can download purchased memories
CREATE POLICY "Buyers can download purchased files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memories' AND EXISTS (
      SELECT 1 FROM orders o
      JOIN memories m ON o.memory_id = m.id
      WHERE o.buyer_id = auth.uid()
      AND o.status = 'completed'
      AND m.file_path = name
    )
  );
