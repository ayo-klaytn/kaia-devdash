/**
 * Script to add the github_metrics_cache table to the database
 * Run this once to create the table
 * 
 * Usage: DATABASE_URL=your_url pnpm tsx scripts/add-github-metrics-cache-table.ts
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
  console.log("Creating github_metrics_cache table...");

  try {
    // Check if table exists
    const checkResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'github_metrics_cache';
    `) as Array<{ table_name: string }> | { rows?: Array<{ table_name: string }> };

    const rows = Array.isArray(checkResult) ? checkResult : (checkResult.rows ?? []);
    
    if (rows.length > 0) {
      console.log("✅ Table github_metrics_cache already exists");
      return;
    }

    // Create the table
    await db.execute(sql`
      CREATE TABLE "github_metrics_cache" (
        "id" text PRIMARY KEY NOT NULL,
        "period_id" text NOT NULL,
        "period_label" text NOT NULL,
        "brand" text NOT NULL,
        "start_date" timestamp NOT NULL,
        "end_date" timestamp,
        "metrics" jsonb NOT NULL,
        "repositories" jsonb NOT NULL,
        "computed_at" timestamp NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    console.log("✅ Table github_metrics_cache created successfully!");
  } catch (error) {
    console.error("❌ Error creating table:", error);
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

