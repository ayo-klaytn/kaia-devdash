import { NextRequest, NextResponse } from "next/server";
import { 
  getUmamiStats, getUmamiPageviews, getUmamiTopPages,
  getUmamiReferrers, getUmamiBrowsers, getUmamiOperatingSystems, getUmamiDevices
} from "@/lib/umami";

export const runtime = 'nodejs';

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
  try { return await p; } catch (e) { console.error(`Umami ${label} failed:`, e); return fb; }
}
function getAug29_2024_toNow() {
  // Start monthly aggregation from Sep 1, 2024 (UTC)
  const start = new Date(Date.UTC(2024, 8, 1, 0, 0, 0));
  return { startAt: start.getTime(), endAt: Date.now() };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const days = Number(sp.get('days') ?? 30);
  const debug = sp.get('debug') === '1';
  const now = Date.now();
  const endAtMs = Number(sp.get('endAt')) || now;
  const startAtMs = Number(sp.get('startAt')) || (endAtMs - days * 86400000);

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
      safe(getUmamiStats(startAtMs, endAtMs), {} as any, 'stats'),
      safe(getUmamiPageviews(startAtMs, endAtMs, 'day'), [] as any[], 'pageviews'),
      safe(getUmamiTopPages(startAtMs, endAtMs), [] as any[], 'topPages'),
      safe(getUmamiReferrers(startAtMs, endAtMs), [] as any[], 'referrers'),
      safe(getUmamiBrowsers(startAtMs, endAtMs), [] as any[], 'browsers'),
      safe(getUmamiOperatingSystems(startAtMs, endAtMs), [] as any[], 'operatingSystems'),
      safe(getUmamiDevices(startAtMs, endAtMs), [] as any[], 'devices'),
    ]);

    const daily_stats = (Array.isArray(pageviewsDay) ? pageviewsDay : []).map((pv: any) => ({
      // Use numeric timestamp for charts to format safely client-side
      date: toMs(pv?.t),
      visitors: pv?.y ?? 0,
      views: pv?.y ?? 0,
    }));

    const { startAt: yStart, endAt: yEnd } = getAug29_2024_toNow();
    const monthlyRaw = await safe(getUmamiPageviews(yStart, yEnd, 'month'), [] as any[], 'monthly');
    const monthly_views = (Array.isArray(monthlyRaw) ? monthlyRaw : []).map((pv: any) => ({
      month: new Date(toMs(pv?.t)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      views: pv?.y ?? 0,
    }));

    // Normalize metric lists to the UI shape
    const pages = (Array.isArray(topPages) ? topPages : []).map((m: any) => ({
      path: m?.x ?? 'Unknown',
      views: Number(m?.y ?? 0)
    }));
    const referrersNorm = (Array.isArray(referrers) ? referrers : []).map((m: any) => ({
      source: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));
    const browsersNorm = (Array.isArray(browsers) ? browsers : []).map((m: any) => ({
      name: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));
    const operatingSystemsNorm = (Array.isArray(operatingSystems) ? operatingSystems : []).map((m: any) => ({
      name: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));
    const devicesNorm = (Array.isArray(devices) ? devices : []).map((m: any) => ({
      type: m?.x ?? 'Unknown',
      visitors: Number(m?.y ?? 0)
    }));

    const pageviewsVal = (stats as any)?.pageviews?.value ?? (stats as any)?.pageviews ?? 0;
    const visitorsVal  = (stats as any)?.visitors?.value ?? (stats as any)?.uniques?.value ?? (stats as any)?.visitors ?? (stats as any)?.uniques ?? 0;
    const sessionsVal  = (stats as any)?.visits?.value   ?? (stats as any)?.sessions?.value ?? (stats as any)?.visits ?? (stats as any)?.sessions ?? visitorsVal;
    const bouncesVal   = (stats as any)?.bounces?.value  ?? (stats as any)?.bounces ?? 0;
    const totaltimeVal = (stats as any)?.totaltime?.value ?? (stats as any)?.totaltime ?? 0;
    const bounceRate   = sessionsVal ? Math.round((bouncesVal / sessionsVal) * 100) : 0;

    const payload: any = {
      overview: {
        views: { value: pageviewsVal, change: 0 },
        visits: { value: sessionsVal,  change: 0 },
        visitors: { value: visitorsVal, change: 0 },
        bounce_rate: { value: bounceRate, change: 0 },
        visit_duration: { value: `${Math.floor(totaltimeVal/60)}m ${Math.floor(totaltimeVal%60)}s`, change: 0 },
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
    res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res;
  } catch (e: any) {
    return NextResponse.json({
      overview: { views:{value:0,change:0}, visits:{value:0,change:0}, visitors:{value:0,change:0}, bounce_rate:{value:0,change:0}, visit_duration:{value:'0m 0s',change:0} },
      daily_stats: [],
      monthly_views: [],
      pages: [], referrers: [], browsers: [], operating_systems: [], devices: [],
      debug: e?.message ?? String(e),
    }, { status: 200 });
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}
