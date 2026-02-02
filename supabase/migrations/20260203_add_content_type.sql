-- Add content_type column to memories table
-- content_type: 'memory' | 'skill' | 'profile'

-- Add column with default value
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'memory';

-- Add constraint for valid content types
ALTER TABLE memories 
ADD CONSTRAINT valid_content_type 
CHECK (content_type IN ('memory', 'skill', 'profile'));

-- Update existing records to have 'memory' type (they were all memories before)
UPDATE memories SET content_type = 'memory' WHERE content_type IS NULL;

-- Create index for filtering by content type
CREATE INDEX IF NOT EXISTS idx_memories_content_type ON memories(content_type);

-- Add subcategory column if not exists
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS subcategory TEXT;
