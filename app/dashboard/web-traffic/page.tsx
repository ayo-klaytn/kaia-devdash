import { UserPen, Package, Users } from "lucide-react";
import { WebTrafficChart, MonthlyViewsChart } from "@/app/dashboard/web-traffic/chart";

export const dynamic = 'force-dynamic';

// Monthly series is now provided by the API; no separate client fetch

export default async function WebTrafficPage() {
  // Resolve absolute base URL from headers at runtime
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';

  try {
    const response = await fetch(`${baseUrl}/api/data/web-traffic?days=30`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const {
      overview,
      pages,
      referrers,
      browsers,
      operating_systems,
      devices,
      monthly_views,
    } = data;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Web Traffic</h1>
          <p className="text-sm text-muted-foreground">
            Web traffic (last 30 days) from Umami Analytics.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{(overview?.views?.value ?? 0).toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <p className="text-sm">Views</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{(overview?.visits?.value ?? 0).toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Visits</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{(overview?.visitors?.value ?? 0).toLocaleString()}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Visitors</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{(overview?.bounce_rate?.value ?? 0)}%</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Bounce Rate</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">
              {overview?.visit_duration?.value ?? '0m 0s'}
            </h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Visit Duration</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <WebTrafficChart
            data={data.daily_stats}
            title="Web Traffic"
            description="Web traffic (last 30 days) from Umami Analytics."
          />
        </div>

        <div className="flex flex-col gap-4">
          <MonthlyViewsChart
            data={(monthly_views ?? []) as Array<{ month: string; views: number }>}
            title="Docs Web Traffic"
            description="Showing total traffic in the last year"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h2 className="text-lg font-bold">Top Pages</h2>
            {(pages ?? []).slice(0, 10).map((page: { path: string; views: number }, i: number) => (
              <div key={page?.path ?? i} className="flex flex-row gap-4 justify-between">
                <h3 className="text-sm truncate">{page?.path ?? 'Unknown'}</h3>
                <p className="text-sm">{((page?.views ?? 0) as number).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h2 className="text-lg font-bold">Top Referrers</h2>
            {(referrers ?? []).slice(0, 10).map((r: { source: string; visitors: number }, i: number) => (
              <div key={r?.source ?? i} className="flex flex-row gap-4 justify-between">
                <h3 className="text-sm truncate">{r?.source ?? 'Unknown'}</h3>
                <p className="text-sm">{((r?.visitors ?? 0) as number).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h2 className="text-lg font-bold">Browsers</h2>
            {(browsers ?? []).slice(0, 10).map((b: any, i: number) => (
              <div key={b?.name ?? i} className="flex flex-row gap-4 justify-between">
                <h3 className="text-sm">{b?.name ?? 'Unknown'}</h3>
                <p className="text-sm">{((b?.visitors ?? 0) as number).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h2 className="text-lg font-bold">Operating Systems</h2>
            {(operating_systems ?? []).slice(0, 10).map((os: any, i: number) => (
              <div key={os?.name ?? i} className="flex flex-row gap-4 justify-between">
                <h3 className="text-sm">{os?.name ?? 'Unknown'}</h3>
                <p className="text-sm">{((os?.visitors ?? 0) as number).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h2 className="text-lg font-bold">Devices</h2>
            {(devices ?? []).slice(0, 10).map((d: any, i: number) => (
              <div key={d?.type ?? i} className="flex flex-row gap-4 justify-between">
                <h3 className="text-sm">{d?.type ?? 'Unknown'}</h3>
                <p className="text-sm">{((d?.visitors ?? 0) as number).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('WebTraffic page error:', error);
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Web Traffic</h1>
          <p className="text-sm text-muted-foreground">
            View web traffic data from Umami Analytics.
          </p>
        </div>
        <div className="border rounded-md p-4 text-red-600">
          Failed to load web traffic data: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
}
