import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sql } from "drizzle-orm";

// Count unique developers for a rolling window (28-31 days)
// Since we have full commit history in DB, we just query by date range - no allowlist needed
async function countUniqueDevelopersForWindow(
  windowStart: Date,
  windowEnd: Date
): Promise<number> {
  const tsFrom = windowStart.toISOString();
  const tsTo = windowEnd.toISOString();

  const rows = await db.execute(sql`
    SELECT COUNT(DISTINCT LOWER(TRIM(c.committer_email)))::int AS cnt
    FROM "commit" c
    WHERE c.timestamp >= ${tsFrom} 
      AND c.timestamp < ${tsTo}
      AND c.committer_email IS NOT NULL 
      AND c.committer_email <> ''
      AND LOWER(c.committer_email) NOT LIKE '%noreply@github.com%'
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

  try {
    const [current, previous] = await Promise.all([
      countActiveDevelopers(curFrom, curTo),
      countActiveDevelopers(pFrom, pTo)
    ]);
    const yoy = previous > 0 ? ((current - previous) / previous) * 100 : null;
    const res = NextResponse.json({
      current: { from: curFrom, to: curTo, activeDevelopers: current },
      previous: { from: pFrom, to: pTo, activeDevelopers: previous },
      yoyPercent: yoy,
    });
    res.headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res;
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}


