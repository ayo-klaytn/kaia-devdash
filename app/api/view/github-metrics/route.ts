import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import db from "@/lib/db";
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from "@/lib/cache";

const PERIOD_CONFIG = [
  { id: "klaytn-2022", label: "2022", brand: "klaytn" as const },
  { id: "klaytn-2023", label: "2023", brand: "klaytn" as const },
  { id: "klaytn-2024", label: "2024 (Jan–Aug)", brand: "klaytn" as const },
  { id: "kaia-2024", label: "Kaia Era (Sep 2024+)", brand: "kaia" as const },
  { id: "all", label: "All Periods", brand: "kaia" as const },
] as const;

const EMAIL_FILTER_SQL = `
  c.committer_email IS NOT NULL
  AND c.committer_email <> ''
  AND c.timestamp IS NOT NULL
  AND LOWER(c.committer_email) NOT LIKE '%noreply@github.com%'
  AND LOWER(c.committer_email) NOT LIKE '%github-actions%'
  AND LOWER(c.committer_email) NOT LIKE '%[bot]%'
  AND LOWER(c.committer_email) NOT LIKE '%bot@%'
`;

type PeriodId = (typeof PERIOD_CONFIG)[number]["id"];

function resolvePeriod(id?: string) {
  const period = PERIOD_CONFIG.find((p) => p.id === id);
  return period ?? PERIOD_CONFIG[PERIOD_CONFIG.length - 2]; // default to kaia-2024
}

function getPeriodBounds(periodId: PeriodId): { start: string; end: string | null } {
  switch (periodId) {
    case "klaytn-2022":
      return {
        start: "2022-01-01T00:00:00Z",
        end: "2023-01-01T00:00:00Z",
      };
    case "klaytn-2023":
      return {
        start: "2023-01-01T00:00:00Z",
        end: "2024-01-01T00:00:00Z",
      };
    case "klaytn-2024":
      return {
        start: "2024-01-01T00:00:00Z",
        end: "2024-09-01T00:00:00Z",
      };
    case "kaia-2024":
      return {
        start: "2024-09-01T00:00:00Z",
        end: null,
      };
    case "all":
    default:
      return {
        start: "2022-01-01T00:00:00Z",
        end: null,
      };
  }
}

function buildTimeCondition(start: string, end: string | null) {
  if (end) {
    return sql`c.timestamp >= ${start} AND c.timestamp < ${end}`;
  }
  return sql`c.timestamp >= ${start}`;
}

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
    const periodParam = req.nextUrl.searchParams.get("period") || undefined;
    const period = resolvePeriod(periodParam);
    
    // Check cache first
    const cacheKey = generateCacheKey("github-metrics", { period: period.id });
    type GithubMetricsResponse = {
      period: {
        id: string;
        label: string;
        brand: "klaytn" | "kaia";
        start: string;
        end: string | null;
      };
      availablePeriods: Array<{ id: string; label: string; brand: "klaytn" | "kaia" }>;
      metrics: {
        repositories: number;
        commits: number;
        developers: number;
        newDevelopers: number;
      };
      repositories: Array<{
        id: string;
        owner: string;
        name: string;
        url: string | null;
        commitCount: number;
        developerCount: number;
        lastCommitAt: string | null;
      }>;
    };
    const cached = await getCachedData<GithubMetricsResponse>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const { start, end } = getPeriodBounds(period.id);

    const timeCondition = buildTimeCondition(start, end);
    const hasForkColumn = await hasIsForkColumn();
    // Exclude specific repos even if not marked as fork
    const excludeSpecificRepos = sql`
      AND NOT (
        (LOWER(r.owner) = 'kaiachain' AND LOWER(r.name) = 'kaia')
        OR (LOWER(r.owner) = 'carv-protocol' AND LOWER(r.name) = 'eliza-d.a.t.a')
      )
    `;
    const forkFilter = hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``;

    type RepoRow = {
      id: string;
      owner: string;
      name: string;
      url: string | null;
      commit_count: number;
      developer_count: number;
      last_commit_at: string | null;
    };

    const repoRowsResult = await db.execute(sql`
      SELECT
        r.id,
        r.owner,
        r.name,
        r.url,
        COUNT(c.sha)::int AS commit_count,
        COUNT(DISTINCT LOWER(TRIM(c.committer_email)))::int AS developer_count,
        MAX(c.timestamp)::text AS last_commit_at
      FROM repository r
      JOIN "commit" c
        ON c.repository_id = r.id
        AND ${timeCondition}
        AND ${sql.raw(EMAIL_FILTER_SQL)}
      WHERE 1=1 ${excludeSpecificRepos} ${forkFilter}
      GROUP BY r.id, r.owner, r.name, r.url
      HAVING COUNT(c.sha) > 0
      ORDER BY LOWER(r.owner) ASC, LOWER(r.name) ASC;
    `) as RepoRow[] | { rows?: RepoRow[] };

    const repoRows = Array.isArray(repoRowsResult)
      ? repoRowsResult
      : (repoRowsResult.rows ?? []);
    
    type TotalsRow = {
      repositories: number;
      commits: number;
      developers: number;
    };

    const totalsResult = await db.execute(sql`
      SELECT
        COUNT(DISTINCT r.id)::int AS repositories,
        COUNT(c.sha)::int AS commits,
        COUNT(DISTINCT LOWER(TRIM(c.committer_email)))::int AS developers
      FROM repository r
      JOIN "commit" c ON c.repository_id = r.id
      WHERE ${timeCondition}
        AND ${sql.raw(EMAIL_FILTER_SQL)}
        ${excludeSpecificRepos} ${forkFilter};
    `) as TotalsRow[] | { rows?: TotalsRow[] };

    const totalsRow = Array.isArray(totalsResult)
      ? (totalsResult[0] ?? { repositories: 0, commits: 0, developers: 0 })
      : ((totalsResult.rows?.[0] as TotalsRow | undefined) ?? {
          repositories: 0,
          commits: 0,
          developers: 0,
        });
    
    type NewDevelopersRow = {
      count: number;
    };

    const newDevelopersResult = await db.execute(sql`
      WITH all_first_commits AS (
        SELECT
          LOWER(TRIM(c.committer_email)) AS email,
          MIN(c.timestamp::timestamp) AS first_ts
        FROM "commit" c
        JOIN repository r ON c.repository_id = r.id
          WHERE ${sql.raw(EMAIL_FILTER_SQL)}
            ${excludeSpecificRepos} ${forkFilter}
        GROUP BY LOWER(TRIM(c.committer_email))
      )
      SELECT COUNT(*)::int AS count
      FROM all_first_commits
      WHERE first_ts >= ${start}
        ${end ? sql`AND first_ts < ${end}` : sql``};
    `) as NewDevelopersRow[] | { rows?: NewDevelopersRow[] };

    const newDevelopers = Array.isArray(newDevelopersResult)
      ? Number((newDevelopersResult[0]?.count ?? 0))
      : Number((newDevelopersResult.rows?.[0]?.count ?? 0));

    const responseData = {
      period: {
        id: period.id,
        label: period.label,
        brand: period.brand,
        start,
        end,
      },
      availablePeriods: PERIOD_CONFIG.map(({ id, label, brand }) => ({
        id,
        label,
        brand,
      })),
      metrics: {
        repositories: Number(totalsRow.repositories ?? 0),
        commits: Number(totalsRow.commits ?? 0),
        developers: Number(totalsRow.developers ?? 0),
        newDevelopers,
      },
      repositories: repoRows.map((row) => ({
        id: row.id,
        owner: row.owner,
        name: row.name,
        url: row.url,
        commitCount: Number(row.commit_count ?? 0),
        developerCount: Number(row.developer_count ?? 0),
        lastCommitAt: row.last_commit_at,
      })),
    };

    // Cache the response
    await setCachedData(cacheKey, responseData, CACHE_TTL.GITHUB_METRICS);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error building github metrics:", error);
    return NextResponse.json(
      { error: "Failed to build GitHub metrics" },
      { status: 500 }
    );
  }
}

