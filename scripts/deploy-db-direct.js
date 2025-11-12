#!/usr/bin/env node
const fs = require('fs');
const { Client } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.qenqilourxtfxchkawek:[YOUR-DB-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

console.log('🚀 Starting database deployment...\n');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function deploy() {
  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the SQL file
    const sql = fs.readFileSync('/tmp/full-reset.sql', 'utf8');
    console.log(`📦 Executing ${sql.split('\n').length} lines of SQL...\n`);

    // Execute the full SQL script
    await client.query(sql);

    console.log('\n🎉 Database deployment successful!');
    console.log('✅ All migrations applied');

  } catch (error) {
    console.error('\n❌ Deployment failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();
