/**
 * Standalone script to compute and store GitHub metrics
 * This version creates its own database connection to avoid caching issues
 */

// Load environment variables FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
const envResult = config({ path: resolve(process.cwd(), '.env.local') });
if (!envResult.parsed) {
  config({ path: resolve(process.cwd(), '.env') });
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded:', process.env.DATABASE_URL.substring(0, 50) + '...');

// Create database connection directly
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { SQL, sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { githubMetricsCache } from "@/lib/db/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  prepare: false,
  ssl: "require",
});
const db = drizzle(client);

const PERIOD_CONFIG = [
  { id: "klaytn-2022", label: "2022", brand: "klaytn" as const },
  { id: "klaytn-2023", label: "2023", brand: "klaytn" as const },
  { id: "klaytn-2024", label: "2024 (Jan–Aug)", brand: "klaytn" as const },
  { id: "kaia-2024", label: "Kaia Era (Sep 2024+)", brand: "kaia" as const },
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

const EXCLUDE_REPOS_SQL = `
  AND NOT (
    (LOWER(r.owner) = 'kaiachain' AND LOWER(r.name) = 'kaia') OR
    (LOWER(r.owner) = 'carv-protocol' AND LOWER(r.name) = 'eliza-d.a.t.a')
  )
`;

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
        ${sql.raw(EXCLUDE_REPOS_SQL)} ${forkFilter} ${sql.raw(EXCLUDED_NAMES_SQL)}
      GROUP BY date_trunc('month', CAST(c.timestamp AS timestamp))
    ) monthly_counts;
  `) as Array<{ total: number }> | { rows?: Array<{ total: number }> };

  const rows = Array.isArray(madResult) ? madResult : (madResult.rows ?? []);
  return Number(rows[0]?.total ?? 0);
}

function getPeriodBounds(periodId: string): { start: string; end: string | null } {
  switch (periodId) {
    case "klaytn-2022":
      return { start: "2022-01-01T00:00:00Z", end: "2023-01-01T00:00:00Z" };
    case "klaytn-2023":
      return { start: "2023-01-01T00:00:00Z", end: "2024-01-01T00:00:00Z" };
    case "klaytn-2024":
      return { start: "2024-01-01T00:00:00Z", end: "2024-09-01T00:00:00Z" };
    case "kaia-2024":
      return { start: "2024-09-01T00:00:00Z", end: null };
    default:
      throw new Error(`Unknown period: ${periodId}`);
  }
}

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

async function computeMetricsForPeriod(periodId: string) {
  const period = PERIOD_CONFIG.find((p) => p.id === periodId);
  if (!period) {
    throw new Error(`Unknown period: ${periodId}`);
  }

  console.log(`\n[${periodId}] Computing metrics...`);
  const { start, end } = getPeriodBounds(periodId);
  const hasForkColumn = await hasIsForkColumn();
  const forkFilter = hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``;

  const timeCondition = end
    ? sql`c.timestamp >= ${start} AND c.timestamp < ${end}`
    : sql`c.timestamp >= ${start}`;
  const excludeSpecificRepos = sql.raw(EXCLUDE_REPOS_SQL);

  // Get repository list with counts
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

  // Get totals
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

  // Get new developers (first commit in this period)
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

  const metrics = {
    repositories: Number(totalsRow.repositories ?? 0),
    commits: Number(totalsRow.commits ?? 0),
    developers: madDevelopers,
    newDevelopers,
  };

  const repositories = repoRows.map((row) => ({
    id: row.id,
    owner: row.owner,
    name: row.name,
    url: row.url,
    commitCount: Number(row.commit_count ?? 0),
    developerCount: Number(row.developer_count ?? 0),
    lastCommitAt: row.last_commit_at,
  }));

  const now = new Date();

  // Upsert into database
  await db
    .insert(githubMetricsCache)
    .values({
      id: periodId,
      periodId: period.id,
      periodLabel: period.label,
      brand: period.brand,
      startDate: new Date(start),
      endDate: end ? new Date(end) : null,
      metrics,
      repositories,
      computedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: githubMetricsCache.id,
      set: {
        metrics,
        repositories,
        computedAt: now,
        updatedAt: now,
      },
    });

  console.log(`[${periodId}] ✅ Stored metrics:`, {
    repositories: metrics.repositories,
    commits: metrics.commits,
    developers: metrics.developers,
    newDevelopers: metrics.newDevelopers,
    repoCount: repositories.length,
  });
}

async function main() {
  console.log("Starting GitHub metrics computation...");
  
  for (const period of PERIOD_CONFIG) {
    try {
      await computeMetricsForPeriod(period.id);
    } catch (error) {
      console.error(`[${period.id}] ❌ Error:`, error);
    }
  }

  console.log("\n✅ All metrics computed and stored!");
  await client.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  client.end().catch(() => {});
  process.exit(1);
});

