import 'dotenv/config';
import db from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Add api_cache table
 * This script applies the migration directly to avoid drizzle-kit push issues
 */
async function addApiCacheTable() {
  console.log('Adding api_cache table...');
  try {
    // Check if table already exists
    type TableCheckRow = { table_name: string };
    const checkResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'api_cache';
    `) as TableCheckRow[] | { rows?: TableCheckRow[] };
    
    let exists = false;
    if (Array.isArray(checkResult)) {
      exists = checkResult.length > 0;
    } else {
      const rows = (checkResult as { rows?: TableCheckRow[] } | undefined)?.rows ?? [];
      exists = rows.length > 0;
    }
    
    if (exists) {
      console.log('✅ Table api_cache already exists');
      return;
    }
    
    // Create the table
    await db.execute(sql`
      CREATE TABLE "api_cache" (
        "cache_key" text PRIMARY KEY NOT NULL,
        "data" json NOT NULL,
        "updated_at" timestamp NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL
      );
    `);
    
    console.log('✅ Successfully created api_cache table');
  } catch (error) {
    console.error('❌ Error creating api_cache table:', error);
    throw error;
  }
}

addApiCacheTable()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

