// Temporary script to run SQL migrations
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration(filename) {
  console.log(`\nRunning migration: ${filename}`);

  const sqlPath = path.join(__dirname, 'sql', filename);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by semicolons but be careful with DO blocks
  const statements = [];
  let currentStatement = '';
  let inDoBlock = false;

  for (const line of sql.split('\n')) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('DO $$') || trimmedLine.startsWith('DO $')) {
      inDoBlock = true;
    }

    currentStatement += line + '\n';

    if (inDoBlock && trimmedLine.includes('$$ LANGUAGE')) {
      inDoBlock = false;
      statements.push(currentStatement.trim());
      currentStatement = '';
    } else if (!inDoBlock && trimmedLine.endsWith(';') && !trimmedLine.startsWith('--')) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (!statement || statement.startsWith('--')) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      if (error) {
        // Try direct query for DDL statements
        const { error: directError } = await supabase.from('_exec').select().limit(0);
        if (directError && !directError.message.includes('does not exist')) {
          throw new Error(error.message);
        }
      }
      successCount++;
      process.stdout.write('.');
    } catch (err) {
      // Some errors are expected (like "already exists")
      if (err.message && (
        err.message.includes('already exists') ||
        err.message.includes('duplicate key')
      )) {
        successCount++;
        process.stdout.write('s');
      } else {
        errorCount++;
        console.error(`\nError: ${err.message}`);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
      }
    }
  }

  console.log(`\nCompleted: ${successCount} success, ${errorCount} errors`);
}

async function main() {
  console.log('Starting migrations...');
  console.log(`Supabase URL: ${supabaseUrl}`);

  // First, let's try to run raw SQL via the REST API
  const sqlFiles = ['video_uploads.sql'];

  for (const file of sqlFiles) {
    const sqlPath = path.join(__dirname, 'sql', file);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`\n=== Running ${file} ===`);

    // Use the Management API to run SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      console.log('RPC method not available, will need to run via Supabase Dashboard');
      console.log(`\nPlease run the following SQL files manually in Supabase Dashboard > SQL Editor:`);
      console.log(`1. sql/video_uploads.sql`);
      console.log(`2. sql/video_storage_bucket.sql`);
      return;
    }

    const result = await response.json();
    console.log('Result:', result);
  }
}

main().catch(console.error);
