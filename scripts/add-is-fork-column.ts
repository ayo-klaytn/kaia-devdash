import 'dotenv/config';
import db from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Add is_fork column to repository table if it doesn't exist
 */
async function addIsForkColumn() {
  try {
    console.log('Adding is_fork column to repository table...');
    
    // Check if column already exists
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repository' 
      AND column_name = 'is_fork';
    `);
    
    const exists = Array.isArray(checkResult) 
      ? checkResult.length > 0 
      : (checkResult.rows?.length ?? 0) > 0;
    
    if (exists) {
      console.log('✅ Column is_fork already exists');
      return;
    }
    
    // Add the column
    await db.execute(sql`
      ALTER TABLE "repository" 
      ADD COLUMN "is_fork" boolean DEFAULT false;
    `);
    
    console.log('✅ Successfully added is_fork column');
  } catch (error) {
    console.error('❌ Error adding is_fork column:', error);
    throw error;
  }
}

addIsForkColumn()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

