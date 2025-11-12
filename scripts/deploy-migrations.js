#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qenqilourxtfxchkawek.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

// Read the full reset SQL file
const sqlFile = '/tmp/full-reset.sql';
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log(`📦 Deploying ${sql.split('\n').length} lines of SQL to production database...`);
console.log(`🎯 Target: ${SUPABASE_URL}`);
console.log('');

// Split into manageable chunks (Supabase has limits on request size)
const statements = sql.split(';').filter(s => s.trim().length > 0);
console.log(`📝 Executing ${statements.length} SQL statements...`);

async function executeSQL(sqlStatement) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sqlStatement + ';' });
    
    const options = {
      hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deploy() {
  let executed = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt || stmt.startsWith('--')) continue;

    try {
      await executeSQL(stmt);
      executed++;
      if (executed % 10 === 0) {
        process.stdout.write(`\r✅ Executed ${executed}/${statements.length} statements...`);
      }
    } catch (error) {
      errors++;
      console.error(`\n❌ Error at statement ${i + 1}:`, error.message.substring(0, 200));
      // Continue with next statement
    }
  }

  console.log(`\n\n🎉 Deployment complete!`);
  console.log(`   ✅ Successful: ${executed}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  if (errors > 0) {
    console.log('\n⚠️  Some statements failed. Check the errors above.');
    process.exit(1);
  }
}

deploy().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
