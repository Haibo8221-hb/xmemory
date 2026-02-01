-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(memory_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE memories
  SET download_count = download_count + 1
  WHERE id = memory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders (as buyer)
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Users can view orders for their memories (as seller)
CREATE POLICY "Sellers can view orders for their memories"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memories
      WHERE memories.id = orders.memory_id
      AND memories.seller_id = auth.uid()
    )
  );

-- Only server can insert/update orders (via service role)
CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated users to insert orders (for checkout)
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

-- Buyers can create reviews for their completed orders
CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = reviews.order_id
      AND orders.buyer_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

-- Sellers can update reviews (for seller_reply only)
CREATE POLICY "Sellers can reply to reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memories
      WHERE memories.id = reviews.memory_id
      AND memories.seller_id = auth.uid()
    )
  );
