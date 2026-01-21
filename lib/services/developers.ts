import { asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/lib/db";
import { developer, commit, developerSummary } from "@/lib/db/schema";
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from "@/lib/cache";

const EMAIL_FILTER_SQL = `
  c.committer_email IS NOT NULL
  AND c.committer_email <> ''
  AND c.timestamp IS NOT NULL
  AND LOWER(c.committer_email) NOT LIKE '%noreply@github.com%'
  AND LOWER(c.committer_email) NOT LIKE '%github-actions%'
  AND LOWER(c.committer_email) NOT LIKE '%[bot]%'
  AND LOWER(c.committer_email) NOT LIKE '%bot@%'
`;

const EXCLUDE_REPOS_SQL = `
  AND NOT (
    (LOWER(r.owner) = 'kaiachain' AND LOWER(r.name) = 'kaia')
    OR (LOWER(r.owner) = 'carv-protocol' AND LOWER(r.name) = 'eliza-d.a.t.a')
  )
`;

const EXCLUDED_NAMES = [
  "ayo-klaytn",
  "praveen-kaia",
  "praveen-klaytn",
  "zxstim",
  "scott lee",
  "github",
  "ollie",
  "kaia-docs",
  "sotatek-quangdo",
  "sotatek-longpham2",
  "sotatek-tule2",
  "sotatek-tinnnguyen",
  "github-actions",
  "github-actions[bot]",
  "jingxuan-kaia",
  "gpt-engineer-app[bot]",
  "google-labs-jules[bot]",
  "sawyer",
  "firebase studio",
  "ollie.j",
  "yumiel yoomee1313",
  "dragon-swap",
  "hyeonlewis",
  "kjeom",
  "your name",
  "root",
  "gitbook-bot",
  "sitongliu-klaytn",
  "aidan",
  "aidenpark-kaia",
  "neoofklaytn",
  "markyim-klaytn",
  "tnasu",
  "shogo hyodo",
  "cursor agent",
  "vibe torch bot",
];

const excludedNameClauses = EXCLUDED_NAMES.map((name) => {
  const escaped = name.toLowerCase().replace(/'/g, "''");
  return `(LOWER(c.committer_name) LIKE '%${escaped}%' OR LOWER(c.committer_email) LIKE '%${escaped}%')`;
});

const excludedNamesSQL = excludedNameClauses.length
  ? `AND NOT (${excludedNameClauses.join(" OR ")})`
  : "";

async function hasIsForkColumn(): Promise<boolean> {
  try {
    const result = (await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'repository'
        AND column_name = 'is_fork';
    `)) as Array<{ column_name: string }> | { rows?: Array<{ column_name: string }> };
    const rows = Array.isArray(result) ? result : result.rows ?? [];
    return rows.length > 0;
  } catch {
    return false;
  }
}

export type DevelopersResponse = {
  numberOfDevelopers: number;
  numberOfActiveMonthlyDevelopers: number;
  monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }>;
  newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }>;
  monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }>;
  uniqueDevelopersAcrossPeriod: number;
  totalDeveloperMonths: number;
  developers: typeof developer.$inferSelect[];
};

export async function getDevelopersData({
  page = 1,
  limit = 200,
}: {
  page?: number;
  limit?: number;
}): Promise<DevelopersResponse> {
  const safeLimit = Math.min(limit, 500);
  const offset = (page - 1) * safeLimit;

  const cacheKey = generateCacheKey("developers", { page, limit: safeLimit });
  const cached = await getCachedData<DevelopersResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 365);

  const responseData: DevelopersResponse = {
    numberOfDevelopers: 0,
    numberOfActiveMonthlyDevelopers: 0,
    monthlyActiveDevelopers: [],
    newDevelopers365d: [],
    monthlyMadProgress: [],
    uniqueDevelopersAcrossPeriod: 0,
    totalDeveloperMonths: 0,
    developers: [],
  };

  // list developers (lightweight columns only)
  console.log("[Developers] Fetching developers list...");
  const developersRows = await db
    .select()
    .from(developer)
    .orderBy(asc(developer.name))
    .limit(safeLimit)
    .offset(offset);

  // Names to exclude (shared between MAD and new devs)
  const excludedNames = EXCLUDED_NAMES;

  // --- Monthly Active Developers (MAD) via summary, with fallback ---
  console.log("[Developers] Fetching MAD from summary...");
  let monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }> = [];
  try {
    let rows = await db
      .select({ email: developerSummary.email, name: developerSummary.displayName })
      .from(developerSummary)
      .where(sql`${developerSummary.window} = 'september-2025'`)
      .limit(1000);

    if (rows.length === 0) {
      rows = await db
        .select({ email: developerSummary.email, name: developerSummary.displayName })
        .from(developerSummary)
        .where(sql`${developerSummary.window} = '28d'`)
        .limit(1000);
    }

    if (rows.length > 0) {
      const filteredRows = rows.filter((row) => {
        const email = row.email || "";
        const name = (row.name || "").toLowerCase();
        const emailLower = email.toLowerCase();

        if (name.includes("[bot]") || name.includes("bot") || emailLower.includes("bot")) return false;

        const isExcluded = excludedNames.some((ex) => {
          const exLower = ex.toLowerCase();
          return (
            name.includes(exLower) ||
            emailLower.includes(exLower) ||
            name === exLower ||
            emailLower === exLower
          );
        });

        return !isExcluded;
      });

      monthlyActiveDevelopers = filteredRows.map((r) => ({ email: r.email, name: r.name }));
    } else {
      const septemberStart = new Date("2025-09-01T00:00:00Z");
      const septemberEnd = new Date("2025-09-30T23:59:59Z");

      const madRaw = await db
        .select({
          committerEmail: commit.committerEmail,
          committerName: commit.committerName,
        })
        .from(commit)
        .where(
          sql`${commit.timestamp} >= ${septemberStart.toISOString()} AND ${commit.timestamp} <= ${septemberEnd.toISOString()}`,
        )
        .groupBy(commit.committerEmail, commit.committerName)
        .limit(1000);

      const byEmail = new Map<string, { email: string | null; name: string | null }>();
      madRaw.forEach((dev) => {
        const email = dev.committerEmail || "no-email";
        const name = (dev.committerName || "").toLowerCase();
        const emailLower = (dev.committerEmail || "").toLowerCase();

        if (name.includes("[bot]") || name.includes("bot") || emailLower.includes("bot")) return;

        const isExcluded = excludedNames.some((ex) => {
          const exLower = ex.toLowerCase();
          return (
            name.includes(exLower) ||
            emailLower.includes(exLower) ||
            name === exLower ||
            emailLower === exLower
          );
        });

        if (isExcluded) return;

        if (!byEmail.has(email) || (!byEmail.get(email)?.name && dev.committerName)) {
          byEmail.set(email, { email: dev.committerEmail || null, name: dev.committerName || null });
        }
      });
      monthlyActiveDevelopers = Array.from(byEmail.values());
    }
  } catch (error) {
    console.error("[Developers] Error fetching MAD:", error);
    monthlyActiveDevelopers = [];
  }

  // --- New developers 365d via summary, with fallback ---
  let newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }> = [];
  try {
    const rows = await db
      .select({
        email: developerSummary.email,
        name: developerSummary.displayName,
        firstAt: developerSummary.firstCommitAt,
      })
      .from(developerSummary)
      .where(sql`${developerSummary.window} = '365d'`)
      .orderBy(asc(developerSummary.firstCommitAt))
      .limit(1000);

    if (rows.length > 0) {
      const filtered = rows.filter((dev) => {
        const email = dev.email || "";
        const name = (dev.name || "").toLowerCase();
        const emailLower = email.toLowerCase();

        if (name.includes("[bot]") || name.includes("bot") || emailLower.includes("bot")) return false;

        const isExcluded = excludedNames.some((ex) => {
          const exLower = ex.toLowerCase();
          return (
            name.includes(exLower) ||
            emailLower.includes(exLower) ||
            name === exLower ||
            emailLower === exLower
          );
        });

        return !isExcluded;
      });

      newDevelopers365d = filtered.map((r) => ({
        email: r.email,
        name: r.name,
        firstAt: r.firstAt ? r.firstAt.toISOString() : "",
      }));
    } else {
      const fromIso = from.toISOString();
      const toIso = to.toISOString();

      const firstCommits = await db
        .select({
          committerEmail: commit.committerEmail,
          committerName: commit.committerName,
          firstCommitTime: sql<string>`MIN(${commit.timestamp})`.as("firstCommitTime"),
        })
        .from(commit)
        .where(sql`${commit.timestamp} >= ${fromIso} AND ${commit.timestamp} <= ${toIso}`)
        .groupBy(commit.committerEmail, commit.committerName)
        .orderBy(asc(sql`MIN(${commit.timestamp})`))
        .limit(1000);

      const filtered = firstCommits.filter((dev) => {
        const email = dev.committerEmail || "";
        const name = (dev.committerName || "").toLowerCase();
        const emailLower = email.toLowerCase();

        if (name.includes("[bot]") || name.includes("bot") || emailLower.includes("bot")) return false;

        const isExcluded = excludedNames.some((ex) => {
          const exLower = ex.toLowerCase();
          return (
            name.includes(exLower) ||
            emailLower.includes(exLower) ||
            name === exLower ||
            emailLower === exLower
          );
        });

        return !isExcluded;
      });

      newDevelopers365d = filtered.map((dev) => ({
        email: dev.committerEmail,
        name: dev.committerName,
        firstAt: dev.firstCommitTime,
      }));
    }
  } catch (error) {
    console.error("[Developers] Error fetching new developers:", error);
    newDevelopers365d = [];
  }

  const hasForkColumn = await hasIsForkColumn();
  const forkFilterSQL = hasForkColumn ? "AND (COALESCE(r.is_fork, false) = false)" : "";

  const startOfWindow = new Date(Date.UTC(2025, 0, 1));
  const endOfWindow = new Date(Date.UTC(2025, 9, 31, 23, 59, 59, 999));

  // --- Monthly MAD progress (Jan–Oct 2025) ---
  let monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }> = [];
  try {
    const PERIOD_CASE_SQL = `
      CASE
        WHEN c.timestamp::timestamp >= '2024-09-01' THEN 'kaia-2024'
        WHEN c.timestamp::timestamp >= '2024-01-01' THEN 'klaytn-2024'
        WHEN c.timestamp::timestamp >= '2023-01-01' THEN 'klaytn-2023'
        ELSE 'klaytn-2022'
      END
    `;

    const monthlyQuery = `
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', '2025-01-01'::date),
          date_trunc('month', '2025-10-01'::date),
          interval '1 month'
        ) AS month_start
      ),
      commit_data AS (
        SELECT 
          date_trunc('month', c.timestamp::timestamp) AS month,
          ${PERIOD_CASE_SQL.trim()} AS period,
          lower(trim(c.committer_email)) AS committer_email
        FROM "commit" c
        JOIN repository r ON r.id = c.repository_id
        WHERE c.timestamp::timestamp >= '2025-01-01'::timestamp
          AND c.timestamp::timestamp < '2025-11-01'::timestamp
          AND ${EMAIL_FILTER_SQL.trim()}
          ${forkFilterSQL}
          ${excludedNamesSQL}
          ${EXCLUDE_REPOS_SQL}
      ),
      monthly_counts AS (
        SELECT month, COUNT(DISTINCT committer_email) AS developer_count
        FROM commit_data
        WHERE period = 'kaia-2024'
        GROUP BY month
      )
      SELECT months.month_start AS month, COALESCE(monthly_counts.developer_count, 0) AS developer_count
      FROM months
      LEFT JOIN monthly_counts ON monthly_counts.month = months.month_start
      ORDER BY months.month_start;
    `;

    type MonthlyRow = {
      month: Date | string;
      developer_count: number;
    };

    const monthlyResult = (await db.execute(
      sql.raw(monthlyQuery),
    )) as MonthlyRow[] | { rows?: MonthlyRow[] };
    const rows = Array.isArray(monthlyResult) ? monthlyResult : monthlyResult.rows ?? [];

    if (rows.length) {
      monthlyMadProgress = rows.map((row) => {
        const monthDate = new Date(row.month);
        return {
          month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          count: Number(row.developer_count ?? 0),
          year: monthDate.getUTCFullYear(),
          monthNumber: monthDate.getUTCMonth() + 1,
        };
      });
    } else {
      monthlyMadProgress = Array.from({ length: 10 }).map((_, index) => {
        const monthDate = new Date(Date.UTC(2025, index, 1));
        return {
          month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          count: 0,
          year: 2025,
          monthNumber: index + 1,
        };
      });
    }
  } catch (error) {
    console.error("[Developers] Error fetching monthly MAD progress:", error);
    monthlyMadProgress = Array.from({ length: 10 }).map((_, index) => {
      const monthDate = new Date(Date.UTC(2025, index, 1));
      return {
        month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        count: 0,
        year: 2025,
        monthNumber: index + 1,
      };
    });
  }

  // --- Unique developers across period & total developer-months ---
  let uniqueDevelopersAcrossPeriod = 0;
  let totalDeveloperMonths = 0;

  try {
    totalDeveloperMonths = monthlyMadProgress.reduce((sum, m) => sum + m.count, 0);

    type UniqueDeveloperRow = {
      developer_count: number;
    };

    const uniqueResult = (await db.execute(sql`
      SELECT COUNT(DISTINCT LOWER(TRIM(c.committer_email)))::int AS developer_count
      FROM "commit" c
      JOIN repository r ON r.id = c.repository_id
      WHERE c.timestamp::timestamp >= ${startOfWindow.toISOString()}
        AND c.timestamp::timestamp <= ${endOfWindow.toISOString()}
        AND ${sql.raw(EMAIL_FILTER_SQL)}
        ${hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``}
        ${excludedNamesSQL ? sql.raw(excludedNamesSQL) : sql``}
        ${sql.raw(EXCLUDE_REPOS_SQL)}
    `)) as UniqueDeveloperRow[] | { rows?: UniqueDeveloperRow[] };

    const uniqueRows = Array.isArray(uniqueResult) ? uniqueResult : uniqueResult.rows ?? [];
    uniqueDevelopersAcrossPeriod = Number(uniqueRows[0]?.developer_count ?? 0);
  } catch (error) {
    console.error("[Developers] Unique developers calculation failed:", error);
    uniqueDevelopersAcrossPeriod = 0;
    totalDeveloperMonths = 0;
  }

  responseData.numberOfDevelopers = developersRows.length;
  responseData.numberOfActiveMonthlyDevelopers = monthlyActiveDevelopers.length;
  responseData.monthlyActiveDevelopers = monthlyActiveDevelopers;
  responseData.newDevelopers365d = newDevelopers365d;
  responseData.monthlyMadProgress = monthlyMadProgress;
  responseData.uniqueDevelopersAcrossPeriod = uniqueDevelopersAcrossPeriod;
  responseData.totalDeveloperMonths = totalDeveloperMonths;
  responseData.developers = developersRows;

  await setCachedData(cacheKey, responseData, CACHE_TTL.DEVELOPERS);

  return responseData;
}

// Helper for API route to preserve existing headers
export function buildDevelopersResponseJson(data: DevelopersResponse): NextResponse {
  const res = NextResponse.json(data);
  res.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
  res.headers.set("CDN-Cache-Control", "public, s-maxage=600");
  res.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=600");
  return res;
}

