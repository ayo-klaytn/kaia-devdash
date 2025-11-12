import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sql } from "drizzle-orm";
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from "@/lib/cache";

// Check if is_fork column exists
async function hasIsForkColumn(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repository' 
      AND column_name = 'is_fork';
    `)
    const rows = Array.isArray(result) ? result : (result.rows ?? [])
    return rows.length > 0
  } catch {
    return false
  }
}

// Count unique developers for a rolling window (28-31 days)
// Since we have full commit history in DB, we just query by date range - no allowlist needed
async function countUniqueDevelopersForWindow(
  windowStart: Date,
  windowEnd: Date
): Promise<number> {
  const tsFrom = windowStart.toISOString();
  const tsTo = windowEnd.toISOString();
  const hasForkColumn = await hasIsForkColumn();
  const forkFilter = hasForkColumn ? sql`AND (COALESCE(r.is_fork, false) = false)` : sql``;
  const excludeSpecificRepos = sql`
    AND NOT (
      (LOWER(r.owner) = 'kaiachain' AND LOWER(r.name) = 'kaia')
      OR (LOWER(r.owner) = 'carv-protocol' AND LOWER(r.name) = 'eliza-d.a.t.a')
    )
  `;

  const rows = await db.execute(sql`
    SELECT COUNT(DISTINCT LOWER(TRIM(c.committer_email)))::int AS cnt
    FROM "commit" c
    JOIN repository r ON r.id = c.repository_id
    WHERE c.timestamp >= ${tsFrom} 
      AND c.timestamp < ${tsTo}
      AND c.committer_email IS NOT NULL 
      AND c.committer_email <> ''
      AND LOWER(c.committer_email) NOT LIKE '%noreply@github.com%'
      ${forkFilter} ${excludeSpecificRepos}
  `);
  
  const first = Array.isArray(rows) && rows.length > 0 ? rows[0] as Record<string, unknown> : {};
  const cnt = Number((first?.cnt as number) ?? 0);
  return Number.isFinite(cnt) ? cnt : 0;
}

// Calculate sum of unique developers across rolling 28-31 day windows
// Similar to MAD calculation approach - uses rolling windows instead of calendar months
// Since we have full commit history, we just query by date range - no filtering needed
async function countActiveDevelopers(from: string, to: string): Promise<number> {
  const windowStart = new Date(from);
  const windowEnd = new Date(to);

  // Generate rolling 30-day windows (28-31 days to account for month length variations)
  // Each window starts from the beginning of a ~30-day period
  const windows: Array<{ start: Date; end: Date }> = [];
  let currentStart = new Date(windowStart);
  
  while (currentStart < windowEnd) {
    // Calculate end of this rolling window (30 days from start, but not beyond windowEnd)
    const windowEndDate = new Date(currentStart);
    windowEndDate.setUTCDate(currentStart.getUTCDate() + 30);
    
    // Clamp to overall window boundaries
    const actualStart = currentStart;
    const actualEnd = windowEndDate < windowEnd ? windowEndDate : windowEnd;

    if (actualStart < actualEnd) {
      windows.push({ start: actualStart, end: actualEnd });
    }

    // Move to next rolling window (start of next ~30-day period)
    currentStart = new Date(windowEndDate);
  }

  // Count unique developers for each rolling window and sum them
  let totalSum = 0;
  for (const window of windows) {
    const windowCount = await countUniqueDevelopersForWindow(window.start, window.end);
    totalSum += windowCount;
  }

  return totalSum;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const sp = request.nextUrl.searchParams;
  const from = sp.get('from');
  const to = sp.get('to');
  const prevFrom = sp.get('prevFrom');
  const prevTo = sp.get('prevTo');

  // Defaults per discussion
  const now = new Date();
  const defaultFrom = '2024-08-29T00:00:00Z';
  const defaultTo = now.toISOString();
  const defaultPrevFrom = '2023-08-28T00:00:00Z';
  const defaultPrevTo = '2024-08-29T00:00:00Z';

  const curFrom = from || defaultFrom;
  const curTo = to || defaultTo;
  const pFrom = prevFrom || defaultPrevFrom;
  const pTo = prevTo || defaultPrevTo;

  // Check cache first
  const cacheKey = generateCacheKey("active-developers", { 
    from: curFrom, 
    to: curTo, 
    prevFrom: pFrom, 
    prevTo: pTo 
  });
  const cached = await getCachedData<any>(cacheKey);
  if (cached) {
    const res = NextResponse.json(cached);
    res.headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res;
  }

  try {
    const [current, previous] = await Promise.all([
      countActiveDevelopers(curFrom, curTo),
      countActiveDevelopers(pFrom, pTo)
    ]);
    const yoy = previous > 0 ? ((current - previous) / previous) * 100 : null;
    const responseData = {
      current: { from: curFrom, to: curTo, activeDevelopers: current },
      previous: { from: pFrom, to: pTo, activeDevelopers: previous },
      yoyPercent: yoy,
    };
    
    // Cache the response
    await setCachedData(cacheKey, responseData, CACHE_TTL.ACTIVE_DEVELOPERS_YOY);
    
    const res = NextResponse.json(responseData);
    res.headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res;
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}


