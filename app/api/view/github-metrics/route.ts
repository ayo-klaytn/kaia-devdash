import { NextRequest, NextResponse } from "next/server";
import { SQL, sql } from "drizzle-orm";

import db from "@/lib/db";
import { githubMetricsCache } from "@/lib/db/schema";
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from "@/lib/cache";

// Increase timeout for complex queries (Next.js default is 10s, Vercel Pro is 60s)
// Set to 60s to match Vercel's limit, but allow some buffer
export const maxDuration = 60;

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

const EXCLUDED_NAMES = [
  'ayo-klaytn',
  'praveen-kaia',
  'praveen-klaytn',
  'zxstim',
  'scott lee',
  'github',
  'ollie',
  'kaia-docs',
  'sotatek-quangdo',
  'sotatek-longpham2',
  'sotatek-tule2',
  'sotatek-tinnnguyen',
  'github-actions',
  'github-actions[bot]',
  'jingxuan-kaia',
  'gpt-engineer-app[bot]',
  'google-labs-jules[bot]',
  'sawyer',
  'firebase studio',
  'ollie.j',
  'yumiel yoomee1313',
  'dragon-swap',
  'hyeonlewis',
  'kjeom',
  'your name',
  'root',
  'gitbook-bot',
  'sitongliu-klaytn',
  'aidan',
  'aidenpark-kaia',
  'neoofklaytn',
  'markyim-klaytn',
  'tnasu',
  'shogo hyodo',
  'cursor agent',
  'vibe torch bot',
];

const EXCLUDED_NAMES_SQL = (() => {
  if (EXCLUDED_NAMES.length === 0) return '';
  const clauses = EXCLUDED_NAMES.map((name) => {
    const escaped = name.toLowerCase().replace(/'/g, "''");
    return `LOWER(c.committer_name) LIKE '%${escaped}%' OR LOWER(c.committer_email) LIKE '%${escaped}%'`;
  });
  return clauses.length ? `AND NOT (${clauses.join(' OR ')})` : '';
})();

async function calculateMadDevelopers({
  start,
  end,
  excludeSpecificRepos,
  forkFilter,
}: {
  start: string;
  end: string | null;
  excludeSpecificRepos: SQL;
  forkFilter: SQL;
}): Promise<number> {
  const madResult = await db.execute(sql`
    SELECT COALESCE(SUM(monthly_count), 0)::int AS total
    FROM (
      SELECT
        date_trunc('month', CAST(c.timestamp AS timestamp)) AS month,
        COUNT(DISTINCT LOWER(TRIM(c.committer_email)))::int AS monthly_count
      FROM "commit" c
      JOIN repository r ON r.id = c.repository_id
      WHERE c.timestamp >= ${start}
        ${end ? sql`AND c.timestamp < ${end}` : sql``}
        AND ${sql.raw(EMAIL_FILTER_SQL)}
        ${excludeSpecificRepos} ${forkFilter} ${sql.raw(EXCLUDED_NAMES_SQL)}
      GROUP BY date_trunc('month', CAST(c.timestamp AS timestamp))
    ) monthly_counts;
  `) as Array<{ total: number }> | { rows?: Array<{ total: number }> };

  const rows = Array.isArray(madResult) ? madResult : (madResult.rows ?? []);
  return Number(rows[0]?.total ?? 0);
}

type PeriodId = (typeof PERIOD_CONFIG)[number]["id"];

type GithubMetricsResponse = {
  period: {
    id: string;
    label: string;
    brand: "klaytn" | "kaia";
    start: string;
    end: string | null;
  };
  availablePeriods: Array<{
    id: string;
    label: string;
    brand: "klaytn" | "kaia";
  }>;
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
    
    // First, check database for pre-computed metrics (fastest)
    // Try direct SQL first (faster than Drizzle for simple queries)
    console.log(`[GitHub Metrics] 🔍 Checking database cache for period: ${period.id}...`);
    try {
      const dbCheckStart = Date.now();
      
      // Use raw SQL with parameterized query (fastest approach)
      const queryPromise = db.execute(sql`
        SELECT 
          period_id,
          period_label,
          brand,
          start_date,
          end_date,
          metrics,
          repositories,
          computed_at
        FROM github_metrics_cache
        WHERE period_id = ${period.id}
        LIMIT 1
      `);
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout after 3s')), 3000)
      );
      
      const cachedResult = await Promise.race([queryPromise, timeoutPromise]) as Array<{
        period_id: string;
        period_label: string;
        brand: string;
        start_date: Date | string;
        end_date: Date | string | null;
        metrics: unknown;
        repositories: unknown;
        computed_at: Date | string;
      }> | { rows?: Array<{
        period_id: string;
        period_label: string;
        brand: string;
        start_date: Date | string;
        end_date: Date | string | null;
        metrics: unknown;
        repositories: unknown;
        computed_at: Date | string;
      }> };
      
      const dbCheckTime = Date.now() - dbCheckStart;
      const cachedRows = Array.isArray(cachedResult) ? cachedResult : (cachedResult.rows ?? []);
      
      if (cachedRows.length > 0) {
        const cached = cachedRows[0];
        const startDate = cached.start_date instanceof Date ? cached.start_date : new Date(cached.start_date);
        const endDate = cached.end_date ? (cached.end_date instanceof Date ? cached.end_date : new Date(cached.end_date)) : null;
        const computedAt = cached.computed_at instanceof Date ? cached.computed_at : new Date(cached.computed_at);
        
        console.log(`[GitHub Metrics] ✅ Database cache HIT for period: ${period.id} (computed at ${computedAt.toISOString()}, query took ${dbCheckTime}ms)`);
        
        const responseData: GithubMetricsResponse = {
          period: {
            id: cached.period_id,
            label: cached.period_label,
            brand: cached.brand as "klaytn" | "kaia",
            start: startDate.toISOString(),
            end: endDate?.toISOString() ?? null,
          },
          availablePeriods: PERIOD_CONFIG.map(({ id, label, brand }) => ({
            id,
            label,
            brand,
          })),
          metrics: cached.metrics as {
            repositories: number;
            commits: number;
            developers: number;
            newDevelopers: number;
          },
          repositories: cached.repositories as Array<{
            id: string;
            owner: string;
            name: string;
            url: string | null;
            commitCount: number;
            developerCount: number;
            lastCommitAt: string | null;
          }>,
        };

        return NextResponse.json(responseData);
      } else {
        console.log(`[GitHub Metrics] ⚠️ No cached data found for period: ${period.id} (query took ${dbCheckTime}ms)`);
      }

    } catch (dbError) {
      const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMsg.includes('timeout')) {
        console.error(`[GitHub Metrics] ❌ Database query timed out (5s) - DB connection may be slow. Error: ${errorMsg}`);
        console.error(`[GitHub Metrics] 💡 This suggests the database is slow or unreachable. Check your DATABASE_URL connection.`);
      } else if (errorMsg.includes('does not exist') || errorMsg.includes('relation') || errorMsg.includes('github_metrics_cache')) {
        console.error(`[GitHub Metrics] ❌ Table github_metrics_cache does not exist. Run: pnpm tsx scripts/add-github-metrics-cache-table-standalone.ts`);
      } else {
        console.error(`[GitHub Metrics] ❌ Database check failed:`, errorMsg.substring(0, 300));
        if (dbError instanceof Error && dbError.stack) {
          console.error(`[GitHub Metrics] Stack:`, dbError.stack.substring(0, 500));
        }
      }
      // Continue to fallback computation (this will be slow)
      console.warn(`[GitHub Metrics] ⚠️ Falling back to on-the-fly computation (will take 60+ seconds)...`);
    }

    // Fallback: Check in-memory cache
    const cacheKey = generateCacheKey("github-metrics", { period: period.id });
    const cached = await getCachedData<GithubMetricsResponse>(cacheKey);
    if (cached) {
      console.log(`[GitHub Metrics] ✅ Memory cache HIT for period: ${period.id}`);
      return NextResponse.json(cached);
    }

    console.log(`[GitHub Metrics] ❌ Cache MISS for period: ${period.id} - computing on-the-fly (this may take 60s)...`);
    console.log(`[GitHub Metrics] 💡 Tip: Run 'pnpm tsx scripts/compute-github-metrics.ts' to pre-compute metrics`);
    
    // Type definition
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
          WHERE 1=1 ${excludeSpecificRepos} ${forkFilter} ${sql.raw(EXCLUDED_NAMES_SQL)}
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
            ${excludeSpecificRepos} ${forkFilter} ${sql.raw(EXCLUDED_NAMES_SQL)};
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
                ${excludeSpecificRepos} ${forkFilter} ${sql.raw(EXCLUDED_NAMES_SQL)}
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

    const madDevelopers = await calculateMadDevelopers({
      start,
      end,
      excludeSpecificRepos,
      forkFilter,
    });

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
          developers: madDevelopers,
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
    console.log(`[GitHub Metrics] ✅ Data generated for period: ${period.id}, caching for ${CACHE_TTL.GITHUB_METRICS} hours`);
    await setCachedData(cacheKey, responseData, CACHE_TTL.GITHUB_METRICS);
    console.log(`[GitHub Metrics] ✅ Cache saved for period: ${period.id}`);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error building github metrics:", error);
    return NextResponse.json(
      { error: "Failed to build GitHub metrics" },
      { status: 500 }
    );
  }
}

