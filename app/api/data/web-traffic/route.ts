import { NextRequest, NextResponse } from "next/server";
import { 
  getUmamiStats, getUmamiPageviews, getUmamiTopPages,
  getUmamiReferrers, getUmamiBrowsers, getUmamiOperatingSystems, getUmamiDevices
} from "@/lib/umami";

export const runtime = 'nodejs';

interface UmamiMetric {
  x: string;
  y: number;
}

function toMs(t: unknown) {
  if (typeof t === 'string') {
    // Handle date strings like "2025-01-01 00:00:00"
    if (t.includes('-') && t.includes(':')) {
      return new Date(t).getTime();
    }
    // Handle numeric strings
    const n = Number(t);
    return Number.isFinite(n) ? (n < 1e12 ? n * 1000 : n) : Date.now();
  }
  const n = t as number;
  return Number.isFinite(n) ? (n < 1e12 ? n * 1000 : n) : Date.now();
}
async function safe<T>(p: Promise<T>, fb: T, label: string): Promise<T> {
  try { 
    const result = await p;
    if (label === 'stats') {
      console.log(`Umami ${label} success:`, JSON.stringify(result, null, 2));
    }
    return result;
  } catch (e) { 
    console.error(`Umami ${label} failed:`, e); 
    return fb; 
  }
}
function getSep01_2024_toNow() {
  // Start monthly aggregation from Sep 1, 2024 (UTC)
  const start = new Date(Date.UTC(2024, 8, 1, 0, 0, 0));
  return { startAt: start.getTime(), endAt: Date.now() };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const days = Number(sp.get('days') ?? 30);
  const debug = sp.get('debug') === '1';
  
  // Match Umami dashboard's "last 30 days" calculation exactly
  // Umami dashboard shows data up to the current moment, so use Date.now() as end time
  const now = Date.now();
  const endAtMs = Number(sp.get('endAt')) || now;
  
  // Calculate start time: exactly N days before end time
  // This matches Umami's "last N days" calculation (rolling window)
  const startAtMs = Number(sp.get('startAt')) || (endAtMs - (days * 24 * 60 * 60 * 1000));
  
  if (debug) {
    console.log('Time range:', {
      days,
      startAt: new Date(startAtMs).toISOString(),
      endAt: new Date(endAtMs).toISOString(),
      startAtMs,
      endAtMs
    });
  }

  try {
    const [
      stats,
      pageviewsDay,
      topPages,
      referrers,
      browsers,
      operatingSystems,
      devices,
    ] = await Promise.all([
      safe(getUmamiStats(startAtMs, endAtMs), {} as unknown, 'stats'),
      safe(getUmamiPageviews(startAtMs, endAtMs, 'day'), [] as Array<Record<string, unknown>>, 'pageviews'),
      safe(getUmamiTopPages(startAtMs, endAtMs), [] as UmamiMetric[], 'topPages'),
      safe(getUmamiReferrers(startAtMs, endAtMs), [] as UmamiMetric[], 'referrers'),
      safe(getUmamiBrowsers(startAtMs, endAtMs), [] as UmamiMetric[], 'browsers'),
      safe(getUmamiOperatingSystems(startAtMs, endAtMs), [] as UmamiMetric[], 'operatingSystems'),
      safe(getUmamiDevices(startAtMs, endAtMs), [] as UmamiMetric[], 'devices'),
    ]);

    const daily_stats = (Array.isArray(pageviewsDay) ? pageviewsDay : []).map((pv: Record<string, unknown>) => ({
      // Use numeric timestamp for charts to format safely client-side
      date: toMs(pv?.t),
      visitors: Number(pv?.y ?? 0),
      views: Number(pv?.y ?? 0),
    }));

    const { startAt: yStart, endAt: yEnd } = getSep01_2024_toNow();
    const monthlyRaw = await safe(getUmamiPageviews(yStart, yEnd, 'month'), [] as Array<Record<string, unknown>>, 'monthly');
    const monthly_views = (Array.isArray(monthlyRaw) ? monthlyRaw : []).map((pv: Record<string, unknown>) => ({
      month: new Date(toMs(pv?.t)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      views: Number(pv?.y ?? 0),
    }));

    // Normalize metric lists to the UI shape
    const pages = (Array.isArray(topPages) ? topPages : []).map((m: UmamiMetric) => ({
      path: m?.x ?? 'Unknown',
      views: Number(m?.y ?? 0)
    }));
    const referrersNorm = (Array.isArray(referrers) ? referrers : []).map((m: UmamiMetric) => ({
      source: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));
    const browsersNorm = (Array.isArray(browsers) ? browsers : []).map((m: UmamiMetric) => ({
      name: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));
    const operatingSystemsNorm = (Array.isArray(operatingSystems) ? operatingSystems : []).map((m: UmamiMetric) => ({
      name: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));
    const devicesNorm = (Array.isArray(devices) ? devices : []).map((m: UmamiMetric) => ({
      type: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));

    // Umami /stats endpoint returns flat numbers, not objects with value/change
    const statsObj = stats as Record<string, unknown>;
    
    // Debug logging
    if (debug) {
      console.log('Umami stats response:', JSON.stringify(statsObj, null, 2));
    }
    
    // Helper to extract number value (handles numbers, strings, and objects with value property)
    const extractNumber = (val: unknown): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const parsed = Number(val);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      if (val && typeof val === 'object' && 'value' in val) {
        const value = (val as { value: unknown }).value;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : 0;
        }
      }
      return 0;
    };
    
    // Extract values from stats - Umami returns flat numbers: { pageviews: 16900, visitors: 7170, visits: 9190, bounces: 7168, totaltime: 678900 }
    const pageviewsFromStats = extractNumber(statsObj?.pageviews);
    const visitorsVal = extractNumber(statsObj?.visitors) || extractNumber(statsObj?.uniques);
    const sessionsVal = extractNumber(statsObj?.visits) || extractNumber(statsObj?.sessions) || visitorsVal;
    const bouncesVal = extractNumber(statsObj?.bounces);
    const totaltimeVal = extractNumber(statsObj?.totaltime);
    
    // Calculate pageviews from daily_stats if stats doesn't have it
    const pageviewsFromDaily = daily_stats.reduce((sum, day) => sum + (day.views || 0), 0);
    const pageviewsVal = pageviewsFromStats > 0 ? pageviewsFromStats : pageviewsFromDaily;
    
    // Log extracted values for debugging
    if (debug) {
      console.log('Extracted values:', { 
        pageviewsFromStats, 
        pageviewsFromDaily, 
        pageviewsVal, 
        visitorsVal, 
        sessionsVal, 
        bouncesVal, 
        totaltimeVal,
        statsKeys: Object.keys(statsObj || {})
      });
    }
    const bounceRate   = sessionsVal ? Math.round((bouncesVal / sessionsVal) * 100) : 0;
    
    // Calculate average visit duration: totaltime is total seconds across all visits
    // Average = totaltime / visits (in seconds), then convert to minutes and seconds
    const avgVisitDurationSeconds = sessionsVal > 0 ? totaltimeVal / sessionsVal : 0;
    const visitDurationMinutes = Math.floor(avgVisitDurationSeconds / 60);
    const visitDurationSeconds = Math.floor(avgVisitDurationSeconds % 60);
    const visitDurationFormatted = `${visitDurationMinutes}m ${visitDurationSeconds}s`;

    const payload: {
      overview: {
        views: { value: number; change: number };
        visits: { value: number; change: number };
        visitors: { value: number; change: number };
        bounce_rate: { value: number; change: number };
        visit_duration: { value: string; change: number };
      };
      daily_stats: Array<{ date: number; visitors: number; views: number }>;
      monthly_views: Array<{ month: string; views: number }>;
      pages: Array<{ path: string; views: number }>;
      referrers: Array<{ source: string; visitors: number }>;
      browsers: Array<{ name: string; visitors: number }>;
      operating_systems: Array<{ name: string; visitors: number }>;
      devices: Array<{ type: string; visitors: number }>;
      __debug?: {
        counts: {
          daily: number;
          monthly: number;
          pages: number;
          referrers: number;
          browsers: number;
          os: number;
          devices: number;
        };
      };
    } = {
      overview: {
        views: { value: pageviewsVal, change: 0 },
        visits: { value: sessionsVal,  change: 0 },
        visitors: { value: visitorsVal, change: 0 },
        bounce_rate: { value: bounceRate, change: 0 },
        visit_duration: { value: visitDurationFormatted, change: 0 },
      },
      daily_stats,
      monthly_views,
      pages,
      referrers: referrersNorm,
      browsers: browsersNorm,
      operating_systems: operatingSystemsNorm,
      devices: devicesNorm,
    };
    if (debug) {
      payload.__debug = {
        counts: {
          daily: Array.isArray(daily_stats) ? daily_stats.length : 0,
          monthly: Array.isArray(monthly_views) ? monthly_views.length : 0,
          pages: Array.isArray(pages) ? pages.length : 0,
          referrers: Array.isArray(referrersNorm) ? referrersNorm.length : 0,
          browsers: Array.isArray(browsersNorm) ? browsersNorm.length : 0,
          os: Array.isArray(operatingSystemsNorm) ? operatingSystemsNorm.length : 0,
          devices: Array.isArray(devicesNorm) ? devicesNorm.length : 0,
        }
      };
    }
    const res = NextResponse.json(payload);
    // Reduced cache time for more real-time sync with Umami dashboard
    // 5 minutes cache to balance freshness and performance
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res;
  } catch (e: unknown) {
    return NextResponse.json({
      overview: { views:{value:0,change:0}, visits:{value:0,change:0}, visitors:{value:0,change:0}, bounce_rate:{value:0,change:0}, visit_duration:{value:'0m 0s',change:0} },
      daily_stats: [],
      monthly_views: [],
      pages: [], referrers: [], browsers: [], operating_systems: [], devices: [],
      debug: e instanceof Error ? e.message : String(e),
    }, { status: 200 });
  }
}

