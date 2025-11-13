import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs'
import db from "@/lib/db";
import { developer, commit, developerSummary } from "@/lib/db/schema";
import { asc, sql } from "drizzle-orm";
async function hasIsForkColumn(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'repository'
        AND column_name = 'is_fork';
    `);
    const rows = Array.isArray(result) ? result : result.rows ?? [];
    return rows.length > 0;
  } catch {
    return false;
  }
}

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

import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from "@/lib/cache";


export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("Starting developers API...");
    // Temporarily disable auth for Vercel testing
    // TODO: Re-enable authentication once we debug the header mismatch
    // const headersList = await headers();
    // const apiSecret = headersList.get('apiSecret');
    // if (process.env.API_SECRET) {
    //   if (!apiSecret) {
    //     return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
    //   }
    //   if (apiSecret !== process.env.API_SECRET) {
    //     return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
    //   }
    // }

  // inputs
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500);
  const offset = (page - 1) * limit;

  // Check cache first
  const cacheKey = generateCacheKey("developers", { page, limit });
  type DevelopersResponse = {
    numberOfDevelopers: number;
    numberOfActiveMonthlyDevelopers: number;
    monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }>;
    newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }>;
    monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }>;
    uniqueDevelopersAcrossPeriod: number;
    totalDeveloperMonths: number;
    developers: unknown[];
  };
  const cached = await getCachedData<DevelopersResponse>(cacheKey);
  if (cached) {
    const res = NextResponse.json(cached);
    res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    return res;
  }
  // default time window for heavy metrics: last 365 days for new developers
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 365); // Changed from 180 to 365 days
  
  const responseData: {
    numberOfDevelopers: number;
    numberOfActiveMonthlyDevelopers: number
    monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }>;
    newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }>;
    monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }>;
    uniqueDevelopersAcrossPeriod: number;
    totalDeveloperMonths: number;
    developers: typeof developer.$inferSelect[];
  } = {
    numberOfDevelopers: 0,
    numberOfActiveMonthlyDevelopers: 0,
    monthlyActiveDevelopers: [],
    newDevelopers365d: [],
    monthlyMadProgress: [],
    uniqueDevelopersAcrossPeriod: 0,
    totalDeveloperMonths: 0,
    developers: []
  }

    // Names to exclude (shared between MAD and new devs)
    const excludedNames = [
      'ayo-klaytn', 'praveen-kaia', 'praveen-klaytn', 'zxstim', 'scott lee', 'github', 'ollie', 
      'kaia-docs', 'sotatek-quangdo', 'sotatek-longpham2', 'sotatek-tule2', 'sotatek-tinnnguyen', 
      'github-actions', 'github-actions[bot]', 'jingxuan-kaia', 'gpt-engineer-app[bot]', 
      'google-labs-jules[bot]', 'sawyer', 'firebase studio', 'ollie.j', 'yumiel yoomee1313',
      'dragon-swap', 'hyeonlewis', 'kjeom', 'your name', 'root', 'gitbook-bot', 
      'sitongliu-klaytn', 'aidan', 'aidenpark-kaia', 'neoofklaytn', 'markyim-klaytn', 
      'tnasu', 'shogo hyodo', 'cursor agent', 'vibe torch bot'
    ];
    const excludedNameClauses = excludedNames.map((name) => {
      const escaped = name.toLowerCase().replace(/'/g, "''");
      return `(LOWER(c.committer_name) LIKE '%${escaped}%' OR LOWER(c.committer_email) LIKE '%${escaped}%')`;
    });
    const excludedNamesSQL = excludedNameClauses.length ? `AND NOT (${excludedNameClauses.join(' OR ')})` : '';

    // list developers (lightweight columns only)
    console.log("Fetching developers...");
    const developers = await db.select()
      .from(developer)
      .orderBy(asc(developer.name))
      .limit(limit)
      .offset(offset);

    console.log('Raw developers from DB:', developers);
    console.log('Number of developers found:', developers.length);

    // Calculate core metrics only

    // Get Monthly Active Developers (September 1-30, 2025) from summary cache; fallback to optimized commit scan
    console.log("Fetching MAD from summary...");
    let monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }> = [];
    try {
      // Try to get from summary cache first - prioritize 'september-2025' window
      let rows = await db
        .select({ email: developerSummary.email, name: developerSummary.displayName })
        .from(developerSummary)
        .where(sql`${developerSummary.window} = 'september-2025'`)
        .limit(1000);
      
      console.log(`Found ${rows.length} rows for september-2025 window`);
      
      // If no september-2025 data, try 28d as fallback
      if (rows.length === 0) {
        console.log("No september-2025 data, trying 28d fallback...");
        rows = await db
          .select({ email: developerSummary.email, name: developerSummary.displayName })
          .from(developerSummary)
          .where(sql`${developerSummary.window} = '28d'`)
          .limit(1000);
        console.log(`Found ${rows.length} rows for 28d window`);
      }
      
      console.log("MAD summary rows:", rows.length);
      if (rows.length > 0) {
        // Apply exclusion filtering to summary data
        const filteredRows = rows.filter(row => {
          const email = row.email || '';
          const name = (row.name || '').toLowerCase();
          const emailLower = email.toLowerCase();
          
          // Skip bots
          if (name.includes('[bot]') || name.includes('bot') || emailLower.includes('bot')) return false;
          
          // Check exclusion list with more robust matching
          const isExcluded = excludedNames.some(ex => {
            const exLower = ex.toLowerCase();
            return name.includes(exLower) || 
                   emailLower.includes(exLower) ||
                   name === exLower ||
                   emailLower === exLower;
          });
          
          if (isExcluded) {
            console.log(`Excluding MAD developer from summary: ${row.name} (${row.email})`);
            return false;
          }
          
          return true;
        });
        
        monthlyActiveDevelopers = filteredRows.map(r => ({ email: r.email, name: r.name }));
        console.log(`MAD after filtering: ${monthlyActiveDevelopers.length} (excluded ${rows.length - filteredRows.length})`);
      } else {
        // Fallback: Get MAD for September 1-30, 2025 with optimized query
        console.log("Using fallback: direct commit scan for September 1-30, 2025");
        const septemberStart = new Date('2025-09-01T00:00:00Z');
        const septemberEnd = new Date('2025-09-30T23:59:59Z');
        
        const madRaw = await db
          .select({ 
            committerEmail: commit.committerEmail, 
            committerName: commit.committerName 
          })
          .from(commit)
          .where(sql`${commit.timestamp} >= ${septemberStart.toISOString()} AND ${commit.timestamp} <= ${septemberEnd.toISOString()}`)
          .groupBy(commit.committerEmail, commit.committerName)
          .limit(1000);
          
        console.log(`Found ${madRaw.length} raw MAD entries from commit scan`);
          
        const byEmail = new Map<string, { email: string | null; name: string | null }>();
        madRaw.forEach(dev => {
          const email = dev.committerEmail || 'no-email';
          const name = (dev.committerName || '').toLowerCase();
          const emailLower = (dev.committerEmail || '').toLowerCase();
          
          // Skip bots
          if (name.includes('[bot]') || name.includes('bot') || emailLower.includes('bot')) return;
          
          // Check exclusion list with more robust matching
          const isExcluded = excludedNames.some(ex => {
            const exLower = ex.toLowerCase();
            return name.includes(exLower) || 
                   emailLower.includes(exLower) ||
                   name === exLower ||
                   emailLower === exLower;
          });
          
          if (isExcluded) {
            console.log(`Excluding MAD developer: ${dev.committerName} (${dev.committerEmail})`);
            return;
          }
          
          if (!byEmail.has(email) || (!byEmail.get(email)?.name && dev.committerName)) {
            byEmail.set(email, { email: dev.committerEmail || null, name: dev.committerName || null });
          }
        });
        monthlyActiveDevelopers = Array.from(byEmail.values());
      }
    } catch (error) {
      console.error('Error fetching MAD:', error);
      monthlyActiveDevelopers = [];
    }

    // New developers in last 365 days from summary; fallback to optimized grouped commit scan
    let newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }> = [];
    try {
      // Try to get from summary cache first
      const rows = await db
        .select({ 
          email: developerSummary.email, 
          name: developerSummary.displayName, 
          firstAt: developerSummary.firstCommitAt 
        })
        .from(developerSummary)
        .where(sql`${developerSummary.window} = '365d'`)
        .orderBy(asc(developerSummary.firstCommitAt))
        .limit(1000);
      if (rows.length > 0) {
        // Filter out excluded names from summary data
        const filtered = rows.filter(dev => {
          const email = dev.email || '';
          const name = (dev.name || '').toLowerCase();
          const emailLower = email.toLowerCase();
          
          // Skip bots
          if (name.includes('[bot]') || name.includes('bot') || emailLower.includes('bot')) return false;
          
          // Check exclusion list with more robust matching
          const isExcluded = excludedNames.some(ex => {
            const exLower = ex.toLowerCase();
            return name.includes(exLower) || 
                   emailLower.includes(exLower) ||
                   name === exLower ||
                   emailLower === exLower;
          });
          
          if (isExcluded) {
            console.log(`Excluding new developer from summary: ${dev.name} (${dev.email})`);
            return false;
          }
          
          return true;
        });
        
        newDevelopers365d = filtered.map(r => ({ 
          email: r.email, 
          name: r.name, 
          firstAt: r.firstAt ? r.firstAt.toISOString() : '' 
        }));
      } else {
        // Fallback: Optimized query with better filtering
        const fromIso = from.toISOString();
        const toIso = to.toISOString();
        
        const firstCommits = await db
          .select({
            committerEmail: commit.committerEmail,
            committerName: commit.committerName,
            firstCommitTime: sql<string>`MIN(${commit.timestamp})`.as('firstCommitTime')
          })
          .from(commit)
          .where(sql`${commit.timestamp} >= ${fromIso} AND ${commit.timestamp} <= ${toIso}`)
          .groupBy(commit.committerEmail, commit.committerName)
          .orderBy(asc(sql`MIN(${commit.timestamp})`))
          .limit(1000);
          
        // Filter out bots and excluded names more efficiently
        const filtered = firstCommits.filter(dev => {
          const email = dev.committerEmail || '';
          const name = (dev.committerName || '').toLowerCase();
          const emailLower = email.toLowerCase();
          
          // Skip bots
          if (name.includes('[bot]') || name.includes('bot') || emailLower.includes('bot')) return false;
          
          // Check exclusion list with more robust matching
          const isExcluded = excludedNames.some(ex => {
            const exLower = ex.toLowerCase();
            return name.includes(exLower) || 
                   emailLower.includes(exLower) ||
                   name === exLower ||
                   emailLower === exLower;
          });
          
          if (isExcluded) {
            console.log(`Excluding new developer: ${dev.committerName} (${dev.committerEmail})`);
            return false;
          }
          
          return true;
        });
        
        newDevelopers365d = filtered.map(dev => ({ 
          email: dev.committerEmail, 
          name: dev.committerName, 
          firstAt: dev.firstCommitTime 
        }));
      }
    } catch (error) {
      console.error('Error fetching new developers:', error);
      newDevelopers365d = [];
    }

    const hasForkColumn = await hasIsForkColumn();
    const forkFilterSQL = hasForkColumn ? 'AND (COALESCE(r.is_fork, false) = false)' : '';

    const startOfWindow = new Date(Date.UTC(2025, 0, 1));
    const endOfWindow = new Date(Date.UTC(2025, 9, 31, 23, 59, 59, 999)); // Oct 31 2025

    // Monthly MAD progress: Jan 2025 – Oct 2025
    // Use the EXACT same logic as developer-metrics to ensure consistency
    let monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }> = [];
    try {
      // This query matches the developer-metrics query structure exactly
      // It uses the same period classification logic (kaia-2024 = timestamp >= 2024-09-01)
      // and filters to Jan-Oct 2025 months
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

      const monthlyResult = await db.execute(sql.raw(monthlyQuery));
      const rows = Array.isArray(monthlyResult)
        ? (monthlyResult as Array<{ month: Date | string; developer_count: number }>)
        : ((monthlyResult.rows ?? []) as Array<{ month: Date | string; developer_count: number }>);

      if (rows.length) {
        monthlyMadProgress = rows.map((row) => {
          const monthDate = new Date(row.month);
          return {
            month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count: Number(row.developer_count ?? 0),
            year: monthDate.getUTCFullYear(),
            monthNumber: monthDate.getUTCMonth() + 1,
          };
        });
      } else {
        monthlyMadProgress = Array.from({ length: 10 }).map((_, index) => {
          const monthDate = new Date(Date.UTC(2025, index, 1));
          return {
            month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count: 0,
            year: 2025,
            monthNumber: index + 1,
          };
        });
      }
    } catch (error) {
      console.error('Error fetching monthly MAD progress:', error);
      monthlyMadProgress = Array.from({ length: 10 }).map((_, index) => {
        const monthDate = new Date(Date.UTC(2025, index, 1));
        return {
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count: 0,
          year: 2025,
          monthNumber: index + 1,
        };
      });
    }

    // Calculate unique developers across last 12 months and total developer-months
    let uniqueDevelopersAcrossPeriod = 0;
    let totalDeveloperMonths = 0;
    
    try {
      // Calculate total developer-months from progress data
      totalDeveloperMonths = monthlyMadProgress.reduce((sum, m) => sum + m.count, 0);
      
      // Get unique developers across last 12 months with optimized query
      const uniqueResult = await db.execute(sql`
        SELECT COUNT(DISTINCT LOWER(TRIM(c.committer_email)))::int AS developer_count
        FROM "commit" c
        JOIN repository r ON r.id = c.repository_id
        WHERE c.timestamp::timestamp >= ${startOfWindow.toISOString()}
          AND c.timestamp::timestamp <= ${endOfWindow.toISOString()}
          AND ${sql.raw(EMAIL_FILTER_SQL)}
          ${hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``}
          ${excludedNamesSQL ? sql.raw(excludedNamesSQL) : sql``}
          ${sql.raw(EXCLUDE_REPOS_SQL)}
      `);

      const uniqueRows = Array.isArray(uniqueResult)
        ? uniqueResult as Array<{ developer_count: number }>
        : (uniqueResult.rows ?? []) as Array<{ developer_count: number }>;

      uniqueDevelopersAcrossPeriod = Number(uniqueRows[0]?.developer_count ?? 0);
    } catch (uniqueError) {
      console.error('Unique developers calculation failed:', uniqueError);
      uniqueDevelopersAcrossPeriod = 0;
      totalDeveloperMonths = 0;
    }

    const numberOfActiveMonthlyDevelopers = monthlyActiveDevelopers.length;
    
    // get developer count 
    const developerCount = developers.length;
    
    responseData.numberOfDevelopers = developerCount;
    responseData.numberOfActiveMonthlyDevelopers = numberOfActiveMonthlyDevelopers;
    responseData.monthlyActiveDevelopers = monthlyActiveDevelopers;
    responseData.newDevelopers365d = newDevelopers365d;
    responseData.monthlyMadProgress = monthlyMadProgress;
    responseData.uniqueDevelopersAcrossPeriod = uniqueDevelopersAcrossPeriod;
    responseData.totalDeveloperMonths = totalDeveloperMonths;
    responseData.developers = developers;

    console.log('Calculated response data:', responseData);

    // Cache the response
    await setCachedData(cacheKey, responseData, CACHE_TTL.DEVELOPERS);

    const res = NextResponse.json(responseData);
    res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    res.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
    res.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600');
    return res;
  } catch (error) {
    console.error('Error in developers API:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: "Database error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}