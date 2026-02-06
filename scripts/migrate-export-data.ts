/**
 * Export data from source database for migration
 * 
 * This script exports all raw data tables to SQL files for migration to a new database.
 * 
 * Usage:
 *   DATABASE_URL=source_db_url bun tsx scripts/migrate-export-data.ts
 * 
 * Output:
 *   Creates SQL files in ./migration-export/ directory:
 *   - repos.sql
 *   - commits.sql
 *   - developers.sql
 *   - social_media.sql
 *   - x_posts.sql
 *   - contributors.sql
 *   - repository_contributors.sql
 *   - cache_github.sql (optional)
 *   - cache_dev.sql (optional)
 *   - cache_mad.sql (optional)
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
  console.error('Usage: DATABASE_URL=source_db_url bun tsx scripts/migrate-export-data.ts');
  process.exit(1);
}

const SOURCE_DB = process.env.DATABASE_URL;
const EXPORT_DIR = path.join(process.cwd(), 'migration-export');

// Tables to export (raw data)
const RAW_TABLES = [
  { name: 'repository', file: 'repos.sql' },
  { name: 'commit', file: 'commits.sql' },
  { name: 'developer', file: 'developers.sql' },
  { name: 'social_media', file: 'social_media.sql' },
  { name: 'x_posts', file: 'x_posts.sql' },
  { name: 'contributor', file: 'contributors.sql' },
  { name: 'repository_contributors', file: 'repository_contributors.sql' },
];

// Cache tables (optional, can be recomputed)
const CACHE_TABLES = [
  { name: 'github_metrics_cache', file: 'cache_github.sql' },
  { name: 'developer_summary', file: 'cache_dev.sql' },
  { name: 'mad_cache_28d', file: 'cache_mad.sql' },
];

async function exportTable(tableName: string, outputFile: string): Promise<void> {
  const outputPath = path.join(EXPORT_DIR, outputFile);
  console.log(`📤 Exporting ${tableName}...`);
  
  try {
    // Use pg_dump to export table data
    const command = `pg_dump "${SOURCE_DB}" -t ${tableName} --data-only --column-inserts > "${outputPath}"`;
    execSync(command, { stdio: 'inherit' });
    
    // Check if file was created and has content
    const stats = await fs.stat(outputPath);
    if (stats.size > 0) {
      console.log(`✅ Exported ${tableName} to ${outputFile} (${stats.size} bytes)`);
    } else {
      console.log(`⚠️  ${tableName} exported but file is empty (table may be empty)`);
    }
  } catch (error) {
    console.error(`❌ Failed to export ${tableName}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database export for migration...');
  console.log(`📊 Source database: ${SOURCE_DB.substring(0, 50)}...`);
  
  // Create export directory
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });
    console.log(`📁 Created export directory: ${EXPORT_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create export directory:', error);
    process.exit(1);
  }
  
  // Export raw data tables
  console.log('\n📦 Exporting raw data tables...');
  for (const table of RAW_TABLES) {
    await exportTable(table.name, table.file);
  }
  
  // Export cache tables (optional)
  console.log('\n💾 Exporting cache tables (optional, can be recomputed)...');
  for (const table of CACHE_TABLES) {
    try {
      await exportTable(table.name, table.file);
    } catch (error) {
      console.log(`⚠️  Skipping ${table.name} (table may not exist or error occurred)`);
    }
  }
  
  // Create README for import instructions
  const readme = `# Migration Export

This directory contains exported data from the source database.

## Files

### Raw Data (Required)
${RAW_TABLES.map(t => `- \`${t.file}\` - ${t.name} table`).join('\n')}

### Cache Tables (Optional - can be recomputed)
${CACHE_TABLES.map(t => `- \`${t.file}\` - ${t.name} table`).join('\n')}

## Import Instructions

1. Create target database
2. Run migrations: \`bunx drizzle-kit migrate\`
3. Import raw data:
   \`\`\`bash
   psql $TARGET_DATABASE_URL < repos.sql
   psql $TARGET_DATABASE_URL < commits.sql
   psql $TARGET_DATABASE_URL < developers.sql
   psql $TARGET_DATABASE_URL < social_media.sql
   psql $TARGET_DATABASE_URL < x_posts.sql
   psql $TARGET_DATABASE_URL < contributors.sql
   psql $TARGET_DATABASE_URL < repository_contributors.sql
   \`\`\`
4. Import cache (optional):
   \`\`\`bash
   psql $TARGET_DATABASE_URL < cache_github.sql
   psql $TARGET_DATABASE_URL < cache_dev.sql
   psql $TARGET_DATABASE_URL < cache_mad.sql
   \`\`\`
5. Recompute cache (recommended):
   \`\`\`bash
   bun tsx scripts/compute-github-metrics.ts
   curl -X POST "$TARGET_BASE_URL/api/jobs/aggregate-github?window=all" \\
     -H "apiSecret: YOUR_API_SECRET"
   \`\`\`

## Export Date
${new Date().toISOString()}
`;
  
  await fs.writeFile(path.join(EXPORT_DIR, 'README.md'), readme);
  
  console.log('\n✅ Export complete!');
  console.log(`📁 Files saved to: ${EXPORT_DIR}`);
  console.log('\n📝 Next steps:');
  console.log('1. Review exported files');
  console.log('2. Create target database');
  console.log('3. Run migrations on target database');
  console.log('4. Import data using psql (see README.md in export directory)');
}

main().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
