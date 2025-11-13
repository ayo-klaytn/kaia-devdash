import 'dotenv/config';
import db from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Add location column to developer table
 * This script applies the migration directly to avoid drizzle-kit push issues
 */
async function addLocationColumn() {
  console.log('Adding location column to developer table...');
  try {
    // Check if column already exists
    type ColumnCheckRow = { column_name: string };
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'developer' 
      AND column_name = 'location';
    `) as ColumnCheckRow[] | { rows?: ColumnCheckRow[] };
    
    const rows = Array.isArray(checkResult)
      ? checkResult
      : ((checkResult as { rows?: ColumnCheckRow[] } | undefined)?.rows ?? []);
    const exists = rows.length > 0;
    
    if (exists) {
      console.log('✅ Column location already exists');
      return;
    }
    
    // Add the column
    await db.execute(sql`
      ALTER TABLE "developer" 
      ADD COLUMN "location" text;
    `);
    
    console.log('✅ Successfully added location column');
  } catch (error) {
    console.error('❌ Error adding location column:', error);
    throw error;
  }
}

addLocationColumn()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

