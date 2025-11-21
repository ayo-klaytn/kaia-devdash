/**
 * Standalone script to add the github_metrics_cache table
 * This version creates its own database connection to avoid caching issues
 */

// Load environment variables FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
const envResult = config({ path: resolve(process.cwd(), '.env.local') });
if (!envResult.parsed) {
  config({ path: resolve(process.cwd(), '.env') });
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded:', process.env.DATABASE_URL.substring(0, 50) + '...');

// Create database connection directly (not using lib/db to avoid caching)
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  prepare: false,
  ssl: "require",
});
const db = drizzle(client);

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
      await client.end();
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
    await client.end();
  } catch (error) {
    console.error("❌ Error creating table:", error);
    await client.end();
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


