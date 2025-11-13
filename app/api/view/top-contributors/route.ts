import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import db from "@/lib/db";

const EMAIL_FILTER_SQL = `
  c.committer_email IS NOT NULL
  AND c.committer_email <> ''
  AND c.timestamp IS NOT NULL
  AND LOWER(c.committer_email) NOT LIKE '%noreply@github.com%'
  AND LOWER(c.committer_email) NOT LIKE '%github-actions%'
  AND LOWER(c.committer_email) NOT LIKE '%[bot]%'
  AND LOWER(c.committer_email) NOT LIKE '%bot@%'
`;

// Check if is_fork column exists
async function hasIsForkColumn(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repository' 
      AND column_name = 'is_fork';
    `) as Array<{ column_name: string }> | { rows?: Array<{ column_name: string }> };
    const rows = Array.isArray(result) ? result : (result.rows ?? []);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
    const days = parseInt(req.nextUrl.searchParams.get("days") || "365");

    const hasForkColumn = await hasIsForkColumn();
    const forkFilter = hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``;
    const excludeKaiachain = sql`AND NOT (LOWER(r.owner) = 'kaiachain' AND LOWER(r.name) = 'kaia')`;

    // Calculate date threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    const thresholdDateStr = thresholdDate.toISOString();

    // Get top contributors by commit count
    const topContributorsResult = await db.execute(sql`
      SELECT 
        LOWER(TRIM(c.committer_email)) AS email,
        MAX(c.committer_name) AS name,
        COUNT(c.sha)::int AS commit_count,
        MAX(c.timestamp::timestamp) AS last_commit_at
      FROM "commit" c
      JOIN repository r ON r.id = c.repository_id
      WHERE c.timestamp >= ${thresholdDateStr}
        AND ${sql.raw(EMAIL_FILTER_SQL)}
        ${forkFilter} ${excludeKaiachain}
      GROUP BY LOWER(TRIM(c.committer_email))
      ORDER BY commit_count DESC
      LIMIT ${limit};
    `);

    const contributors = Array.isArray(topContributorsResult)
      ? (topContributorsResult as Array<{
          email: string;
          name: string | null;
          commit_count: number;
          last_commit_at: string | null;
        }>)
      : ((topContributorsResult.rows ?? []) as Array<{
          email: string;
          name: string | null;
          commit_count: number;
          last_commit_at: string | null;
        }>);

    // Try to get location from developer table (if we have GitHub username mapping)
    // For now, we'll return the data and let the script enrich it
    const enrichedContributors = await Promise.all(
      contributors.map(async (contrib) => {
        // Try to find developer by email or extract GitHub username from email
        // This is a simplified approach - we'll enrich via script
        return {
          email: contrib.email,
          name: contrib.name || contrib.email.split("@")[0],
          commitCount: contrib.commit_count,
          lastCommitAt: contrib.last_commit_at,
          location: null as string | null, // Will be enriched by script
        };
      })
    );

    return NextResponse.json({
      contributors: enrichedContributors,
      total: enrichedContributors.length,
    });
  } catch (error) {
    console.error("Error fetching top contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch top contributors" },
      { status: 500 }
    );
  }
}

