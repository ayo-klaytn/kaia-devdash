import { NextResponse } from "next/server";
import db from "@/lib/db";
import { commit } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('MAD Debug - Starting...');
    
    // Calculate the 28-day window
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    
    const now = new Date();
    
    console.log('MAD Debug - Date range:', {
      from: twentyEightDaysAgo.toISOString(),
      to: now.toISOString(),
      daysDiff: Math.floor((now.getTime() - twentyEightDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
    });

    // Get all commits in the 28-day window
    console.log('MAD Debug - Querying commits...');
    const madRaw = await db
      .select({ 
        committerEmail: commit.committerEmail,
        committerName: commit.committerName,
        timestamp: commit.timestamp,
        repositoryId: commit.repositoryId,
      })
      .from(commit)
      .where(
        sql`${commit.timestamp} >= ${twentyEightDaysAgo.toISOString()}`
      )
      .orderBy(commit.timestamp);

    console.log('MAD Debug - Raw commits found:', madRaw.length);

    // Get recent commits (last 7 days) to check data freshness
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCommits = await db
      .select({ 
        committerEmail: commit.committerEmail,
        committerName: commit.committerName,
        timestamp: commit.timestamp,
      })
      .from(commit)
      .where(
        sql`${commit.timestamp} >= ${sevenDaysAgo.toISOString()}`
      )
      .orderBy(commit.timestamp);

    // Get total commits in database
    const totalCommitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(commit);
    const totalCommits = totalCommitsResult[0]?.count || 0;

    // Get latest commit timestamp
    const latestCommit = await db
      .select({ 
        timestamp: commit.timestamp,
        committerName: commit.committerName,
        repositoryId: commit.repositoryId,
      })
      .from(commit)
      .orderBy(sql`${commit.timestamp} DESC`)
      .limit(1);

    // Process MAD data (same logic as main API)
    const excludedNames = [
      'ayo-klaytn', 'praveen-kaia', 'zxstim', 'scott lee', 'github', 'ollie', 
      'kaia-docs', 'sotatek-quangdo', 'sotatek-longpham2', 'github-actions', 'jingxuan-kaia'
    ];

    const madByEmail = new Map<string, { email: string | null; name: string | null }>();
    
    madRaw.forEach(dev => {
      if (dev.committerEmail && 
          !excludedNames.some(excluded => 
            dev.committerName?.toLowerCase().includes(excluded.toLowerCase()) ||
            dev.committerEmail?.toLowerCase().includes(excluded.toLowerCase())
          )) {
        madByEmail.set(dev.committerEmail, {
          email: dev.committerEmail,
          name: dev.committerName || null
        });
      }
    });

    const monthlyActiveDevelopers = Array.from(madByEmail.values());

    // Group commits by day to see activity pattern
    const commitsByDay = madRaw.reduce((acc, commit) => {
      if (commit.timestamp) {
        const day = new Date(commit.timestamp).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get sample of excluded commits
    const excludedCommits = madRaw.filter(dev => 
      !dev.committerEmail || 
      excludedNames.some(excluded => 
        dev.committerName?.toLowerCase().includes(excluded.toLowerCase()) ||
        dev.committerEmail?.toLowerCase().includes(excluded.toLowerCase())
      )
    ).slice(0, 10); // First 10 excluded commits

    return NextResponse.json({
      debug: {
        dateRange: {
          from: twentyEightDaysAgo.toISOString(),
          to: now.toISOString(),
          daysDiff: Math.floor((now.getTime() - twentyEightDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
        },
        dataFreshness: {
          totalCommitsInDB: totalCommits,
          latestCommit: latestCommit[0] || null,
          commitsInLast7Days: recentCommits.length,
          commitsInLast28Days: madRaw.length,
        },
        madCalculation: {
          rawCommitsFound: madRaw.length,
          excludedCommits: excludedCommits.length,
          finalMADCount: monthlyActiveDevelopers.length,
          excludedNames: excludedNames,
        },
        activityPattern: {
          commitsByDay: commitsByDay,
          totalDaysWithActivity: Object.keys(commitsByDay).length,
        },
        sampleExcludedCommits: excludedCommits.map(c => ({
          committerName: c.committerName,
          committerEmail: c.committerEmail,
          timestamp: c.timestamp,
          repositoryId: c.repositoryId,
        })),
        sampleMADDevelopers: monthlyActiveDevelopers.slice(0, 10),
        sampleRecentCommits: recentCommits.slice(0, 5).map(c => ({
          committerName: c.committerName,
          committerEmail: c.committerEmail,
          timestamp: c.timestamp,
        })),
      }
    });

  } catch (error) {
    console.error('MAD Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
