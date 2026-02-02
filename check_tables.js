const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uupwzvbrcmiwkutgeqza.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cHd6dmJyY21pd2t1dGdlcXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MTY0NCwiZXhwIjoyMDg1NDQ3NjQ0fQ.k5m8wg-JuQN3_Seql_jF-bHgLgP2KhPehcNkAm09rUc'
);

async function check() {
  console.log('Checking tables...\n');
  const tables = ['skills', 'user_profiles', 'export_history', 'memories', 'profiles'];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log('NOT EXISTS:', t);
    } else if (error) {
      console.log('ERROR:', t, '-', error.message);
    } else {
      console.log('EXISTS:', t);
    }
  }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
