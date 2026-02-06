/**
 * Import data to target database from exported SQL files
 * 
 * This script imports SQL files exported by migrate-export-data.ts into a target database.
 * 
 * Usage:
 *   DATABASE_URL=target_db_url bun tsx scripts/migrate-import-data.ts
 * 
 * Prerequisites:
 *   1. Run migrations on target database first: bunx drizzle-kit migrate
 *   2. Have exported SQL files in ./migration-export/ directory
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
const envResult = config({ path: resolve(process.cwd(), '.env.local') });
if (!envResult.parsed) {
  config({ path: resolve(process.cwd(), '.env') });
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables!');
  console.error('Usage: DATABASE_URL=target_db_url bun tsx scripts/migrate-import-data.ts');
  process.exit(1);
}

const TARGET_DB = process.env.DATABASE_URL;
const EXPORT_DIR = path.join(process.cwd(), 'migration-export');

// Tables to import (raw data - required)
const RAW_TABLES = [
  { name: 'repository', file: 'repos.sql' },
  { name: 'commit', file: 'commits.sql' },
  { name: 'developer', file: 'developers.sql' },
  { name: 'social_media', file: 'social_media.sql' },
  { name: 'x_posts', file: 'x_posts.sql' },
  { name: 'contributor', file: 'contributors.sql' },
  { name: 'repository_contributors', file: 'repository_contributors.sql' },
];

// Cache tables (optional)
const CACHE_TABLES = [
  { name: 'github_metrics_cache', file: 'cache_github.sql' },
  { name: 'developer_summary', file: 'cache_dev.sql' },
  { name: 'mad_cache_28d', file: 'cache_mad.sql' },
];

async function importTable(sqlFile: string, tableName: string, required: boolean): Promise<void> {
  const sqlPath = path.join(EXPORT_DIR, sqlFile);
  
  try {
    // Check if file exists
    await fs.access(sqlPath);
    
    // Check file size
    const stats = await fs.stat(sqlPath);
    if (stats.size === 0) {
      console.log(`⚠️  Skipping ${tableName} (file is empty)`);
      return;
    }
    
    console.log(`📥 Importing ${tableName} from ${sqlFile}...`);
    
    // Use psql to import
    const command = `psql "${TARGET_DB}" < "${sqlPath}"`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Imported ${tableName}`);
  } catch (error: unknown) {
    if (required) {
      console.error(`❌ Failed to import required table ${tableName}:`, error);
      throw error;
    } else {
      console.log(`⚠️  Skipping ${tableName} (file not found or error occurred)`);
    }
  }
}

async function verifyImport(): Promise<void> {
  console.log('\n🔍 Verifying imported data...');
  
  // Use psql to run verification queries
  const verifyQuery = `
    SELECT 
      'repository' as table_name, COUNT(*) as row_count FROM repository
    UNION ALL
    SELECT 'commit', COUNT(*) FROM commit
    UNION ALL
    SELECT 'developer', COUNT(*) FROM developer
    UNION ALL
    SELECT 'social_media', COUNT(*) FROM social_media
    UNION ALL
    SELECT 'x_posts', COUNT(*) FROM x_posts
    UNION ALL
    SELECT 'contributor', COUNT(*) FROM contributor
    UNION ALL
    SELECT 'repository_contributors', COUNT(*) FROM repository_contributors;
  `;
  
  try {
    const result = execSync(
      `psql "${TARGET_DB}" -c "${verifyQuery.replace(/\n/g, ' ')}"`,
      { encoding: 'utf-8' }
    );
    console.log(result);
  } catch (error) {
    console.log('⚠️  Could not verify data (this is okay if psql is not available)');
  }
}

async function main() {
  console.log('🚀 Starting database import...');
  console.log(`📊 Target database: ${TARGET_DB.substring(0, 50)}...`);
  
  // Check if export directory exists
  try {
    await fs.access(EXPORT_DIR);
  } catch {
    console.error(`❌ Export directory not found: ${EXPORT_DIR}`);
    console.error('Please run migrate-export-data.ts first to create export files.');
    process.exit(1);
  }
  
  // Import raw data tables (required)
  console.log('\n📦 Importing raw data tables (required)...');
  for (const table of RAW_TABLES) {
    await importTable(table.file, table.name, true);
  }
  
  // Import cache tables (optional)
  console.log('\n💾 Importing cache tables (optional)...');
  for (const table of CACHE_TABLES) {
    await importTable(table.file, table.name, false);
  }
  
  // Verify import
  await verifyImport();
  
  console.log('\n✅ Import complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify data integrity (check row counts)');
  console.log('2. Recompute cache (recommended):');
  console.log('   bun tsx scripts/compute-github-metrics.ts');
  console.log('   curl -X POST "$TARGET_BASE_URL/api/jobs/aggregate-github?window=all" \\');
  console.log('     -H "apiSecret: YOUR_API_SECRET"');
  console.log('3. Update application DATABASE_URL');
  console.log('4. Update GitHub Actions secrets');
  console.log('5. Test application endpoints');
}

main().catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
