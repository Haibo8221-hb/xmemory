-- Add email field to profiles for email upload matching
-- Users can bind their email to receive uploads sent from that address

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add unique constraint (optional, uncomment if needed)
-- ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

COMMENT ON COLUMN profiles.email IS 'User email for email upload matching. When user sends email from this address to upload@xmemory.work, content is automatically saved to their account.';
