const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uupwzvbrcmiwkutgeqza.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cHd6dmJyY21pd2t1dGdlcXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MTY0NCwiZXhwIjoyMDg1NDQ3NjQ0fQ.k5m8wg-JuQN3_Seql_jF-bHgLgP2KhPehcNkAm09rUc',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createTestUsers() {
  // Test Account 1
  const { data: user1, error: err1 } = await supabase.auth.admin.createUser({
    email: 'test1@xmemory.work',
    password: 'Test123456!',
    email_confirm: true
  });
  
  if (err1) {
    console.log('User1 error:', err1.message);
  } else {
    console.log('User1 created:', user1.user.email);
    // Create profile
    await supabase.from('profiles').upsert({
      id: user1.user.id,
      email: user1.user.email,
      plan: 'free'
    });
  }
  
  // Test Account 2
  const { data: user2, error: err2 } = await supabase.auth.admin.createUser({
    email: 'test2@xmemory.work',
    password: 'Test123456!',
    email_confirm: true
  });
  
  if (err2) {
    console.log('User2 error:', err2.message);
  } else {
    console.log('User2 created:', user2.user.email);
    // Create profile
    await supabase.from('profiles').upsert({
      id: user2.user.id,
      email: user2.user.email,
      plan: 'free'
    });
  }
}

createTestUsers().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
