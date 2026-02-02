#!/usr/bin/env node
/**
 * 自动执行 Supabase 数据库迁移
 * 用法: node scripts/run-migration.js <sql-file>
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'uupwzvbrcmiwkutgeqza.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cHd6dmJyY21pd2t1dGdlcXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3MTY0NCwiZXhwIjoyMDg1NDQ3NjQ0fQ.k5m8wg-JuQN3_Seql_jF-bHgLgP2KhPehcNkAm09rUc';

async function execSQL(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    
    const req = https.request({
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode === 200 && result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || body));
          }
        } catch (e) {
          reject(new Error(body));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runMigration(filePath) {
  console.log('🚀 Running migration:', filePath);
  console.log('');
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by semicolon but keep CREATE FUNCTION blocks together
  const statements = [];
  let current = '';
  let inFunction = false;
  
  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    
    // Skip comments
    if (trimmed.startsWith('--')) continue;
    
    current += line + '\n';
    
    if (trimmed.includes('$$')) {
      inFunction = !inFunction;
    }
    
    if (!inFunction && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt.length > 1) {
        statements.push(stmt);
      }
      current = '';
    }
  }
  
  console.log(`Found ${statements.length} statements\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 50).replace(/\n/g, ' ') + '...';
    
    try {
      await execSQL(stmt);
      console.log(`✓ ${i + 1}/${statements.length}: ${preview}`);
      success++;
    } catch (err) {
      console.log(`✗ ${i + 1}/${statements.length}: ${err.message}`);
      failed++;
    }
  }
  
  console.log('');
  console.log(`✅ Done: ${success} succeeded, ${failed} failed`);
}

// Main
const sqlFile = process.argv[2];

if (!sqlFile) {
  console.log('Usage: node scripts/run-migration.js <sql-file>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/run-migration.js supabase/migrations/002_xray_profiles.sql');
  process.exit(1);
}

const filePath = path.resolve(sqlFile);

if (!fs.existsSync(filePath)) {
  console.error('❌ File not found:', filePath);
  process.exit(1);
}

runMigration(filePath).catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
