import { NextRequest, NextResponse } from "next/server";
import { SQL, sql } from "drizzle-orm";
import db from "@/lib/db";
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from "@/lib/cache";

// Increase timeout for complex queries (Next.js default is 10s, Vercel Pro is 60s)
export const maxDuration = 60;

type FullYearYoYResponse = {
  view: 'full-year';
  data: Array<{
    year: number;
    distinctAuthors: number;
    yoyPercent: number | null;
  }>;
};

type JanAugYoYResponse = {
  view: 'jan-aug';
  data: {
    '2024': { distinctAuthors: number; period: string };
    '2025': { distinctAuthors: number; period: string };
    yoyPercent: number | null;
  };
};

type SepOctYoYResponse = {
  view: 'sep-oct';
  data: {
    '2024': { distinctAuthors: number; period: string };
    '2025': { distinctAuthors: number; period: string };
    yoyPercent: number | null;
  };
};

type Granularity = 'monthly' | 'quarterly';

type KaiaEraYoYResponse = {
  view: 'kaia-era';
  granularity: Granularity;
  data: Array<{
    period: string;
    distinctAuthors: number;
    start: string;
    end: string;
  }>;
};

type GithubYoYResponse =
  | FullYearYoYResponse
  | JanAugYoYResponse
  | SepOctYoYResponse
  | KaiaEraYoYResponse;

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

async function calculateMadSum({
  start,
  end,
  forkFilter,
}: {
  start: string;
  end: string;
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
        AND c.timestamp < ${end}
        AND ${sql.raw(EMAIL_FILTER_SQL)}
        ${forkFilter}
        ${sql.raw(EXCLUDED_NAMES_SQL)}
        ${sql.raw(EXCLUDE_REPOS_SQL)}
      GROUP BY date_trunc('month', CAST(c.timestamp AS timestamp))
    ) monthly_counts;
  `) as Array<{ total: number }> | { rows?: Array<{ total: number }> };

  const rows = Array.isArray(madResult) ? madResult : (madResult.rows ?? []);
  return Number(rows[0]?.total ?? 0);
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

// Sum monthly active developers (MAD) for a date range
async function sumMadDevelopers(start: string, end: string): Promise<number> {
  const hasForkColumn = await hasIsForkColumn();
  const forkFilter = hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``;
  return calculateMadSum({ start, end, forkFilter });
}

export async function GET(req: NextRequest) {
  try {
    const view = req.nextUrl.searchParams.get('view') || 'full-year';
    const granularityParam = req.nextUrl.searchParams.get('granularity');
    const granularity: Granularity = granularityParam === 'quarterly' ? 'quarterly' : 'monthly';
    
    console.log(`[GitHub YoY] 🔍 Request received for view: ${view}${view === 'kaia-era' ? `, granularity: ${granularity}` : ''}`);
    
    // Check cache first - include granularity for kaia-era view
    const cacheParams: Record<string, string> = { view };
    if (view === 'kaia-era') {
      cacheParams.granularity = granularity;
    }
    const cacheKey = generateCacheKey("github-yoy-analysis", cacheParams);
    const cached = await getCachedData<GithubYoYResponse>(cacheKey);
    if (cached) {
      console.log(`[GitHub YoY] ✅ Cache HIT for view: ${view}${view === 'kaia-era' ? `, granularity: ${granularity}` : ''}`);
      return NextResponse.json(cached);
    }
    console.log(`[GitHub YoY] ❌ Cache MISS for view: ${view}${view === 'kaia-era' ? `, granularity: ${granularity}` : ''}, generating data...`);

    let responseData: GithubYoYResponse;

    if (view === 'full-year') {
      // Full-year Y-o-Y: 2022, 2023, 2024 (if complete)
      console.log(`[GitHub YoY] Computing full-year data...`);
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth(); // 0-11
      
      const years = [
        { year: 2022, start: '2022-01-01T00:00:00Z', end: '2023-01-01T00:00:00Z' },
        { year: 2023, start: '2023-01-01T00:00:00Z', end: '2024-01-01T00:00:00Z' },
      ];

      // Only include 2024 if it's complete (we're in 2025 or later, or it's past Dec 31, 2024)
      if (currentYear > 2024 || (currentYear === 2024 && currentMonth === 11 && now.getUTCDate() === 31)) {
        years.push({ year: 2024, start: '2024-01-01T00:00:00Z', end: '2025-01-01T00:00:00Z' });
      }

      console.log(`[GitHub YoY] Counting distinct authors for ${years.length} years...`);
      const yearData = await Promise.all(
        years.map(async (y) => {
          console.log(`[GitHub YoY] Counting ${y.year} MAD...`);
          const count = await sumMadDevelopers(y.start, y.end);
          console.log(`[GitHub YoY] ${y.year}: ${count} MAD`);
          return { year: y.year, distinctAuthors: count };
        })
      );
      console.log(`[GitHub YoY] Full-year data computed`);

      // Calculate YoY percentages
      const yearDataWithYoY = yearData.map((data, index) => {
        let yoyPercent: number | null = null;
        if (index > 0) {
          const previous = yearData[index - 1];
          if (previous.distinctAuthors > 0) {
            yoyPercent = ((data.distinctAuthors - previous.distinctAuthors) / previous.distinctAuthors) * 100;
          } else if (data.distinctAuthors > 0) {
            yoyPercent = 100; // Infinite growth from zero
          }
        }
        return { ...data, yoyPercent };
      });

      responseData = {
        view: 'full-year',
        data: yearDataWithYoY,
      };
    } else if (view === 'jan-aug') {
      // Jan-Aug comparison: 2024 vs 2025
      console.log(`[GitHub YoY] Computing Jan-Aug comparison...`);
      console.log(`[GitHub YoY] Counting 2024 MAD...`);
      const count2024 = await sumMadDevelopers('2024-01-01T00:00:00Z', '2024-09-01T00:00:00Z');
      console.log(`[GitHub YoY] 2024: ${count2024} MAD`);
      console.log(`[GitHub YoY] Counting 2025 MAD...`);
      const count2025 = await sumMadDevelopers('2025-01-01T00:00:00Z', '2025-09-01T00:00:00Z');
      console.log(`[GitHub YoY] 2025: ${count2025} MAD`);

      const yoyPercent = count2024 > 0 
        ? ((count2025 - count2024) / count2024) * 100 
        : (count2025 > 0 ? 100 : null);

      responseData = {
        view: 'jan-aug',
        data: {
          '2024': { distinctAuthors: count2024, period: 'Jan 1 - Aug 31, 2024' },
          '2025': { distinctAuthors: count2025, period: 'Jan 1 - Aug 31, 2025' },
          yoyPercent,
        },
      };
    } else if (view === 'sep-oct') {
      // Sep-Oct comparison: 2024 vs 2025
      console.log(`[GitHub YoY] Computing Sep-Oct comparison...`);

      const range2024 = { start: '2024-09-01T00:00:00Z', end: '2024-11-01T00:00:00Z' };
      const range2025 = { start: '2025-09-01T00:00:00Z', end: '2025-11-01T00:00:00Z' };

      console.log(`[GitHub YoY] Counting Sep-Oct 2024 MAD...`);
      const count2024 = await sumMadDevelopers(range2024.start, range2024.end);
      console.log(`[GitHub YoY] 2024 (Sep-Oct): ${count2024} MAD`);

      console.log(`[GitHub YoY] Counting Sep-Oct 2025 MAD...`);
      const now = new Date();
      const range2025End = new Date(range2025.end);
      const effectiveEnd2025 = now < range2025End ? now.toISOString() : range2025.end;
      const count2025 = await sumMadDevelopers(range2025.start, effectiveEnd2025);
      console.log(`[GitHub YoY] 2025 (Sep-Oct): ${count2025} MAD`);

      const yoyPercent = count2024 > 0 
        ? ((count2025 - count2024) / count2024) * 100 
        : (count2025 > 0 ? 100 : null);

      responseData = {
        view: 'sep-oct',
        data: {
          '2024': { distinctAuthors: count2024, period: 'Sep 1 - Oct 31, 2024' },
          '2025': { distinctAuthors: count2025, period: `Sep 1 - Oct 31, 2025${now < range2025End ? ' (partial)' : ''}` },
          yoyPercent,
        },
      };
    } else if (view === 'kaia-era') {
      // Kaia Era: Monthly or quarterly from Sep 1, 2024 onward
      // granularity is already extracted above
      
      const now = new Date();
      const nowUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0, 0
      ));
      const startDate = new Date('2024-09-01T00:00:00Z');
      const periods: Array<{ start: string; end: string; label: string }> = [];

      if (granularity === 'monthly') {
        // Generate monthly periods from Sep 2024 to current month
        let current = new Date(startDate);
        let monthCount = 0;
        const maxMonths = 24; // Safety limit: max 24 months (2 years)
        
        while (current <= nowUTC && monthCount < maxMonths) {
          const periodStart = new Date(current);
          // Calculate end of month in UTC
          const periodEnd = new Date(Date.UTC(
            current.getUTCFullYear(),
            current.getUTCMonth() + 1,
            1,
            0, 0, 0, 0
          ));
          const endDate = periodEnd > nowUTC ? nowUTC : periodEnd;
          
          periods.push({
            start: periodStart.toISOString(),
            end: endDate.toISOString(),
            label: periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          });
          
          // Move to next month in UTC
          current = new Date(Date.UTC(
            current.getUTCFullYear(),
            current.getUTCMonth() + 1,
            1,
            0, 0, 0, 0
          ));
          monthCount++;
        }
      } else {
        // Quarterly periods
        const quarters = [
          { start: '2024-09-01T00:00:00Z', end: '2024-12-01T00:00:00Z', label: 'Q4 2024' },
          { start: '2024-12-01T00:00:00Z', end: '2025-03-01T00:00:00Z', label: 'Q1 2025' },
          { start: '2025-03-01T00:00:00Z', end: '2025-06-01T00:00:00Z', label: 'Q2 2025' },
          { start: '2025-06-01T00:00:00Z', end: '2025-09-01T00:00:00Z', label: 'Q3 2025' },
          { start: '2025-09-01T00:00:00Z', end: '2025-12-01T00:00:00Z', label: 'Q4 2025' },
        ];

        for (const quarter of quarters) {
          const quarterStart = new Date(quarter.start);
          const quarterEnd = new Date(quarter.end);
          if (quarterEnd <= nowUTC) {
            // Complete quarter
            periods.push({
              start: quarter.start,
              end: quarter.end,
              label: quarter.label,
            });
          } else if (quarterStart <= nowUTC) {
            // Current quarter (incomplete)
            periods.push({
              start: quarter.start,
              end: nowUTC.toISOString(),
              label: quarter.label + ' (partial)',
            });
            break;
          }
        }
      }

      console.log(`[Kaia Era] Generating ${granularity} view with ${periods.length} periods`);
      
      if (periods.length === 0) {
        console.warn('[Kaia Era] No periods generated - this might indicate a date calculation issue');
        responseData = {
          view: 'kaia-era',
          granularity,
          data: [],
        };
      } else {
        // Optimize: Batch queries in smaller groups to avoid overwhelming the database
        // Run 5 queries at a time instead of all 15 at once
        console.log(`[Kaia Era] Computing ${periods.length} periods in batches of 5...`);
        const queryStartTime = Date.now();
        
        const BATCH_SIZE = 5;
        const periodData: Array<{
          period: string;
          distinctAuthors: number;
          start: string;
          end: string;
        }> = [];
        
        // Process periods in batches
        for (let i = 0; i < periods.length; i += BATCH_SIZE) {
          const batch = periods.slice(i, i + BATCH_SIZE);
          console.log(`[Kaia Era] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(periods.length / BATCH_SIZE)} (${batch.length} periods)...`);
          
          const batchResults = await Promise.allSettled(
            batch.map(async (period, batchIdx) => {
              const queryStart = Date.now();
              const globalIdx = i + batchIdx;
              console.log(`[Kaia Era] [${globalIdx + 1}/${periods.length}] Querying ${period.label}...`);
              try {
                const count = await sumMadDevelopers(period.start, period.end);
                const queryTime = Date.now() - queryStart;
                console.log(`[Kaia Era] [${globalIdx + 1}/${periods.length}] ${period.label}: ${count} MAD (${queryTime}ms)`);
                return {
                  period: period.label,
                  distinctAuthors: count,
                  start: period.start,
                  end: period.end,
                };
              } catch (error) {
                const queryTime = Date.now() - queryStart;
                console.error(`[Kaia Era] [${globalIdx + 1}/${periods.length}] Error for ${period.label} (${queryTime}ms):`, error);
                throw error;
              }
            })
          );
          
          // Add successful results
          batchResults.forEach((result, batchIdx) => {
            if (result.status === 'fulfilled') {
              periodData.push(result.value);
            } else {
              const period = batch[batchIdx];
              console.error(`[Kaia Era] Error for ${period.label}:`, result.reason);
              periodData.push({
                period: period.label,
                distinctAuthors: 0,
                start: period.start,
                end: period.end,
              });
            }
          });
        }
        
        const totalTime = Date.now() - queryStartTime;
        console.log(`[Kaia Era] All batches completed in ${totalTime}ms for ${periods.length} periods`);

        console.log(`[Kaia Era] Query completed: ${periodData.length} periods`);
        
        responseData = {
          view: 'kaia-era',
          granularity,
          data: periodData,
        };
      }
    } else {
      return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }

        // Cache the response - use longer TTL for Kaia Era since it's expensive to compute
        const cacheTTL = view === 'kaia-era' ? CACHE_TTL.GITHUB_METRICS * 2 : CACHE_TTL.GITHUB_METRICS;
        await setCachedData(cacheKey, responseData, cacheTTL);

    const granularityLabel =
      responseData.view === 'kaia-era' ? responseData.granularity : '';
    console.log(
      `[GitHub YoY] Returning ${view} data:`,
      responseData.view,
      granularityLabel,
      Array.isArray(responseData.data) ? `${responseData.data.length} items` : 'object'
    );
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error generating GitHub YoY analysis:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to generate GitHub YoY analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

