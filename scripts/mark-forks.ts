import 'dotenv/config';
import db from '@/lib/db';
import { repository } from '@/lib/db/schema';
import { eq, and, like, ilike } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

/**
 * Mark specific repositories as forks based on the provided list
 * Format: { owner: string, name: string } for specific owner/repo pairs
 * Format: string for repo name only (will match all owners)
 */
const FORKED_REPOS: Array<{ owner: string; name: string } | string> = [
  // Specific owner/repo pairs
  { owner: 'dragonswap-app', name: 'dimension-adapters' },
  { owner: 'CrederLabs', name: 'defillama-server' },
  { owner: 'elysia-dev', name: 'DefiLlama-Adapters' },
  { owner: 'CrederLabs', name: 'DefiLlama-Adapters' },
  { owner: 'carv-protocol', name: 'eliza-d.a.t.a' },
  // Repos by name only (match all owners)
  'DeFiLlama-servers',
  'DefiLlama-Adapter',
  'solana-oft-example',
  'StanToken',
  'bip39',
  'cdn',
  'stader-node',
  'ZKredit',
  'zodiac-module-reality',
  'reality-eth-mono',
  'snapshot-strategies',
  'terraform-aws-ks',
];

async function ensureIsForkColumn() {
  try {
    console.log('Checking if is_fork column exists...');
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
      console.log('✅ Column is_fork already exists\n');
      return;
    }
    
    console.log('⚠️  Column is_fork does not exist. Adding it...');
    await db.execute(sql`
      ALTER TABLE "repository" 
      ADD COLUMN IF NOT EXISTS "is_fork" boolean DEFAULT false;
    `);
    
    console.log('✅ Successfully added is_fork column\n');
  } catch (error) {
    console.error('❌ Error ensuring is_fork column:', error);
    throw error;
  }
}

async function markForks() {
  // First, ensure the column exists
  await ensureIsForkColumn();
  
  console.log('Marking repositories as forks...');
  console.log(`Found ${FORKED_REPOS.length} repositories/patterns to mark as forks\n`);

  let markedCount = 0;
  let notFoundCount = 0;

  for (const repoSpec of FORKED_REPOS) {
    try {
      let repos;
      let searchKey: string;

      if (typeof repoSpec === 'object') {
        // Specific owner/repo pair
        repos = await db
          .select()
          .from(repository)
          .where(
            and(
              ilike(repository.owner, repoSpec.owner),
              eq(repository.name, repoSpec.name)
            )
          );
        searchKey = `${repoSpec.owner}/${repoSpec.name}`;
      } else {
        // Repo name only - match all owners
        repos = await db
          .select()
          .from(repository)
          .where(eq(repository.name, repoSpec));
        searchKey = repoSpec;
      }

      if (repos.length === 0) {
        console.log(`⚠️  Not found: ${searchKey}`);
        notFoundCount++;
        continue;
      }

      // Mark all matching repos as forks
      for (const repo of repos) {
        await db
          .update(repository)
          .set({ isFork: true, updatedAt: new Date() })
          .where(eq(repository.id, repo.id));

        console.log(`✅ Marked as fork: ${repo.owner}/${repo.name}`);
        markedCount++;
      }
    } catch (error) {
      console.error(`❌ Error marking ${typeof repoSpec === 'object' ? `${repoSpec.owner}/${repoSpec.name}` : repoSpec}:`, error);
    }
  }
  
  // Also mark kaiachain/kaia repo as fork
  try {
    const kaiachainRepos = await db
      .select()
      .from(repository)
      .where(
        and(
          ilike(repository.owner, 'kaiachain'),
          eq(repository.name, 'kaia')
        )
      );
    
    for (const repo of kaiachainRepos) {
      await db
        .update(repository)
        .set({ isFork: true, updatedAt: new Date() })
        .where(eq(repository.id, repo.id));
      
      console.log(`✅ Marked as fork: ${repo.owner}/${repo.name}`);
      markedCount++;
    }
    
    if (kaiachainRepos.length === 0) {
      console.log('⚠️  No kaiachain/kaia repo found');
    } else {
      console.log(`✅ Found and marked kaiachain/kaia repo`);
    }
  } catch (error) {
    console.error('❌ Error marking kaiachain/kaia repo:', error);
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Marked as forks: ${markedCount}`);
  console.log(`⚠️  Not found: ${notFoundCount}`);
  console.log('\nFinished marking forks');
}

markForks()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

