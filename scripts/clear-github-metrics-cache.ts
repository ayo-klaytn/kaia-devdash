/**
 * Script to clear the GitHub metrics cache
 * This will delete all cached metrics from the github_metrics_cache table
 * 
 * Usage: DATABASE_URL=your_url pnpm tsx scripts/clear-github-metrics-cache.ts
 * Or set DATABASE_URL in .env.local file
 */

// Load environment variables FIRST, before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
const envResult = config({ path: resolve(process.cwd(), '.env.local') });
if (!envResult.parsed) {
  config({ path: resolve(process.cwd(), '.env') });
}

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables!');
  console.error('Make sure .env.local or .env file exists with DATABASE_URL set');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded:', process.env.DATABASE_URL.substring(0, 50) + '...');
console.log('Database host:', new URL(process.env.DATABASE_URL!).hostname);

// Clear any cached db connection to force re-initialization
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__dbClient = undefined;
}

import db from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Clearing GitHub metrics cache...");

  try {
    // Check if table exists
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'github_metrics_cache';
    `) as Array<{ table_name: string }> | { rows?: Array<{ table_name: string }> };

    const tableRows = Array.isArray(tableCheck) ? tableCheck : (tableCheck.rows ?? []);
    
    if (tableRows.length === 0) {
      console.log("⚠️ Table github_metrics_cache does not exist. Nothing to clear.");
      return;
    }

    // Delete all cached metrics
    const result = await db.execute(sql`
      DELETE FROM github_metrics_cache
    `) as unknown[] | { rowCount?: number };

    const deletedCount = Array.isArray(result) 
      ? result.length 
      : ((result as { rowCount?: number }).rowCount ?? 0);

    console.log(`✅ Cleared ${deletedCount} cached metric entries from github_metrics_cache`);
    console.log("\n💡 Next step: Run 'pnpm tsx scripts/compute-github-metrics-standalone.ts' to re-compute metrics with the updated filters");
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });


