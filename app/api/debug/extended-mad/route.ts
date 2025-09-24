import { NextResponse } from "next/server";
import db from "@/lib/db";
import { commit } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Extended MAD Debug - Starting...');
    
    // Test different time windows
    const now = new Date();
    const windows = [
      { days: 7, name: '7 days' },
      { days: 14, name: '14 days' },
      { days: 28, name: '28 days' },
      { days: 35, name: '35 days' },
      { days: 60, name: '60 days' },
    ];

    const results = [];

    for (const window of windows) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - window.days);
      
      const commits = await db
        .select({ 
          committerEmail: commit.committerEmail,
          committerName: commit.committerName,
          timestamp: commit.timestamp,
        })
        .from(commit)
        .where(
          sql`${commit.timestamp} >= ${startDate.toISOString()}`
        );

      // Count unique developers
      const uniqueDevelopers = new Set();
      commits.forEach(commit => {
        if (commit.committerEmail) {
          uniqueDevelopers.add(commit.committerEmail);
        }
      });

      results.push({
        window: window.name,
        days: window.days,
        totalCommits: commits.length,
        uniqueDevelopers: uniqueDevelopers.size,
        dateRange: {
          from: startDate.toISOString(),
          to: now.toISOString()
        }
      });
    }

    // Get commits by month for the last 6 months
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthCommits = await db
        .select({ 
          committerEmail: commit.committerEmail,
          committerName: commit.committerName,
        })
        .from(commit)
        .where(
          sql`${commit.timestamp} >= ${monthStart.toISOString()} AND ${commit.timestamp} <= ${monthEnd.toISOString()}`
        );

      const uniqueDevelopers = new Set();
      monthCommits.forEach(commit => {
        if (commit.committerEmail) {
          uniqueDevelopers.add(commit.committerEmail);
        }
      });

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalCommits: monthCommits.length,
        uniqueDevelopers: uniqueDevelopers.size,
        dateRange: {
          from: monthStart.toISOString(),
          to: monthEnd.toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      debug: {
        timeWindows: results,
        monthlyData: monthlyData.reverse(), // Most recent first
        summary: {
          issue: "Very low recent commit activity - only 10 commits in last 28 days",
          recommendation: "Check if commit crawling script is running and if API secret authentication is working"
        }
      }
    });

  } catch (error) {
    console.error('Extended MAD Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
