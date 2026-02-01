-- Migration: Feature Updates
-- 1. 二级分类 (subcategory)
-- 2. 卖家认证 (seller verification)
-- 3. 销量统计 (sales_count)

-- 1. 添加 subcategory 到 memories 表
ALTER TABLE memories ADD COLUMN IF NOT EXISTS subcategory TEXT;
CREATE INDEX IF NOT EXISTS idx_memories_subcategory ON memories(subcategory);

-- 2. 添加卖家认证字段到 profiles 表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sales_count INT DEFAULT 0;

-- 3. 创建函数：订单完成时更新销量
CREATE OR REPLACE FUNCTION update_sales_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 只在状态变为 completed 时更新
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- 更新卖家的 sales_count
    UPDATE profiles
    SET sales_count = sales_count + 1
    WHERE id = (SELECT seller_id FROM memories WHERE id = NEW.memory_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建触发器
DROP TRIGGER IF EXISTS on_order_completed ON orders;
CREATE TRIGGER on_order_completed
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_sales_count();

-- 5. 更新现有卖家的 sales_count (基于历史订单)
UPDATE profiles p
SET sales_count = (
  SELECT COUNT(*)
  FROM orders o
  JOIN memories m ON o.memory_id = m.id
  WHERE m.seller_id = p.id AND o.status = 'completed'
);
