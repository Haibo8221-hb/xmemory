-- xmemory RLS (Row Level Security) Policies
-- 确保数据安全，用户只能访问允许的数据

-- ============================================
-- 1. PROFILES 表
-- ============================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看公开资料
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能插入自己的资料（注册时）
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. MEMORIES 表
-- ============================================

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看已发布的 Memory
CREATE POLICY "memories_select_active" ON memories
  FOR SELECT USING (status = 'active');

-- 卖家可以查看自己所有的 Memory（包括草稿）
CREATE POLICY "memories_select_own" ON memories
  FOR SELECT USING (auth.uid() = seller_id);

-- 卖家可以创建 Memory
CREATE POLICY "memories_insert_own" ON memories
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- 卖家只能更新自己的 Memory
CREATE POLICY "memories_update_own" ON memories
  FOR UPDATE USING (auth.uid() = seller_id);

-- 卖家只能删除自己的 Memory
CREATE POLICY "memories_delete_own" ON memories
  FOR DELETE USING (auth.uid() = seller_id);

-- ============================================
-- 3. ORDERS 表
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 买家可以查看自己的订单
CREATE POLICY "orders_select_buyer" ON orders
  FOR SELECT USING (auth.uid() = buyer_id);

-- 卖家可以查看关于自己 Memory 的订单
CREATE POLICY "orders_select_seller" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = orders.memory_id 
      AND memories.seller_id = auth.uid()
    )
  );

-- 用户可以创建自己的订单（购买）
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 只有系统可以更新订单状态（通过 service_role）
-- 普通用户不能更新订单
CREATE POLICY "orders_update_none" ON orders
  FOR UPDATE USING (false);

-- ============================================
-- 4. REVIEWS 表
-- ============================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看评价
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT USING (true);

-- 买家可以为已完成的订单创建评价
CREATE POLICY "reviews_insert_buyer" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = reviews.order_id 
      AND orders.buyer_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

-- 买家可以更新自己的评价（修改评论）
CREATE POLICY "reviews_update_buyer" ON reviews
  FOR UPDATE USING (auth.uid() = buyer_id);

-- 卖家可以更新 seller_reply 字段
-- 注意：这需要更精细的控制，暂时允许卖家更新相关评价
CREATE POLICY "reviews_update_seller_reply" ON reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = reviews.memory_id 
      AND memories.seller_id = auth.uid()
    )
  );

-- ============================================
-- 5. STORAGE POLICIES (for memory files)
-- ============================================

-- 在 Supabase Dashboard > Storage > Policies 中设置:
-- 
-- Bucket: memories
-- 
-- SELECT (下载): 
--   - 已购买的用户可以下载
--   - auth.uid() IN (SELECT buyer_id FROM orders WHERE memory_id = ... AND status = 'completed')
--
-- INSERT (上传):
--   - 已登录用户可以上传到自己的文件夹
--   - (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- DELETE:
--   - 用户可以删除自己的文件

-- ============================================
-- 注意事项
-- ============================================
-- 
-- 1. Webhook 更新订单状态需要使用 service_role key
--    （绕过 RLS，因为订单更新策略是 false）
--
-- 2. 如果策略冲突或需要调整，可以删除后重建：
--    DROP POLICY "policy_name" ON table_name;
--
-- 3. 查看当前策略：
--    SELECT * FROM pg_policies WHERE tablename = 'memories';
