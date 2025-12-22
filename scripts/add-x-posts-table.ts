import 'dotenv/config';
import { sql } from 'drizzle-orm';
import db from '@/lib/db';

/**
 * Create the x_posts table in the database
 * Run this script once to set up the table
 */
async function addXPostsTable() {
  try {
    console.log('Creating x_posts table...');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS x_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        views TEXT,
        views_number INTEGER,
        likes INTEGER NOT NULL DEFAULT 0,
        retweets INTEGER NOT NULL DEFAULT 0,
        comments INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        account TEXT NOT NULL DEFAULT 'BuildonKaia',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create index on date for faster sorting
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_x_posts_date ON x_posts(date DESC)
    `);

    // Create index on account for filtering
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_x_posts_account ON x_posts(account)
    `);

    // Create index on type for filtering
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_x_posts_type ON x_posts(type)
    `);

    console.log('✅ x_posts table created successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Create a CSV file named "x-posts.csv" with your posts');
    console.log('2. Place it in lib/mocks/, lib/data/, scripts/, or project root');
    console.log('3. Call POST /api/jobs/fetch-x-posts to process the CSV');
    console.log('4. Or use POST /api/data/x-posts to upload posts directly');
  } catch (error) {
    console.error('❌ Error creating x_posts table:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

addXPostsTable();

