const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uupwzvbrcmiwkutgeqza.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cHd6dmJyY21pd2t1dGdlcXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MTY0NCwiZXhwIjoyMDg1NDQ3NjQ0fQ.Mv8lFJGKnKsXQQVPvl3LIJRYltKjX5AXSqYfMwv9Rl0'
);

async function runMigration() {
  // Add email column to profiles
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    `
  });
  
  if (error) {
    console.error('Migration error:', error);
    // Try direct approach
    const { error: error2 } = await supabase
      .from('profiles')
      .select('email')
      .limit(1);
    
    if (error2 && error2.message.includes('column')) {
      console.log('Column does not exist, need to add via dashboard');
    } else {
      console.log('Column might already exist');
    }
  } else {
    console.log('Migration successful');
  }
}

runMigration();
