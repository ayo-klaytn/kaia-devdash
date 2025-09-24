import { NextResponse } from "next/server";
import db from "@/lib/db";
import { commit } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Simple MAD Debug - Starting...');
    
    // Calculate the 28-day window
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    
    console.log('Simple MAD Debug - Date range:', {
      from: twentyEightDaysAgo.toISOString(),
      to: new Date().toISOString()
    });

    // Simple query first
    console.log('Simple MAD Debug - Querying total commits...');
    const totalCommitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(commit);
    
    const totalCommits = totalCommitsResult[0]?.count || 0;
    console.log('Simple MAD Debug - Total commits:', totalCommits);

    // Get commits in 28-day window
    console.log('Simple MAD Debug - Querying 28-day commits...');
    const madRaw = await db
      .select({ 
        committerEmail: commit.committerEmail,
        committerName: commit.committerName,
        timestamp: commit.timestamp,
      })
      .from(commit)
      .where(
        sql`${commit.timestamp} >= ${twentyEightDaysAgo.toISOString()}`
      )
      .limit(10); // Limit to 10 for testing

    console.log('Simple MAD Debug - 28-day commits found:', madRaw.length);

    // Get latest commit
    console.log('Simple MAD Debug - Getting latest commit...');
    const latestCommit = await db
      .select({ 
        timestamp: commit.timestamp,
        committerName: commit.committerName,
      })
      .from(commit)
      .orderBy(sql`${commit.timestamp} DESC`)
      .limit(1);

    console.log('Simple MAD Debug - Latest commit:', latestCommit[0]);

    return NextResponse.json({
      success: true,
      debug: {
        totalCommits,
        commitsIn28Days: madRaw.length,
        latestCommit: latestCommit[0] || null,
        sampleCommits: madRaw.slice(0, 5),
        dateRange: {
          from: twentyEightDaysAgo.toISOString(),
          to: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Simple MAD Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
