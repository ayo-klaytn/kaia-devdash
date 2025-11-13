import { UserPen, Package, Users, Eye, Clock, TrendingDown } from "lucide-react";
import { WebTrafficChart, MonthlyViewsChart } from "@/app/dashboard/web-traffic/chart";
import { Card, CardContent } from "@/components/ui/card";

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

    const kpiCards = [
      {
        value: (overview?.views?.value ?? 0).toLocaleString(),
        label: "Views",
        icon: Eye,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50 dark:bg-blue-950/20",
        gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
      },
      {
        value: (overview?.visits?.value ?? 0).toLocaleString(),
        label: "Visits",
        icon: UserPen,
        iconColor: "text-green-600",
        iconBg: "bg-green-50 dark:bg-green-950/20",
        gradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
      },
      {
        value: (overview?.visitors?.value ?? 0).toLocaleString(),
        label: "Visitors",
        icon: Users,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-50 dark:bg-purple-950/20",
        gradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
      },
      {
        value: `${(overview?.bounce_rate?.value ?? 0)}%`,
        label: "Bounce Rate",
        icon: TrendingDown,
        iconColor: "text-orange-600",
        iconBg: "bg-orange-50 dark:bg-orange-950/20",
        gradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10",
      },
      {
        value: overview?.visit_duration?.value ?? '0m 0s',
        label: "Visit Duration",
        icon: Clock,
        iconColor: "text-cyan-600",
        iconBg: "bg-cyan-50 dark:bg-cyan-950/20",
        gradient: "from-cyan-50 to-cyan-100/50 dark:from-cyan-950/20 dark:to-cyan-900/10",
      },
    ];

    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Web Traffic</h1>
          <p className="text-muted-foreground">
            Web traffic (last 30 days) from Umami Analytics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index}
                className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-0 shadow-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{card.label}</p>
                      <h2 className="text-3xl font-bold tracking-tight">{card.value}</h2>
                    </div>
                    <div className={`${card.iconBg} p-3 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Pages</h2>
              <div className="space-y-2">
                {(pages ?? []).slice(0, 10).map((page: { path: string; views: number }, i: number) => (
                  <div 
                    key={page?.path ?? i} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm truncate flex-1">{page?.path ?? 'Unknown'}</span>
                    <span className="text-sm font-medium text-muted-foreground ml-4">
                      {((page?.views ?? 0) as number).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Top Referrers</h2>
              <div className="space-y-2">
                {(referrers ?? []).slice(0, 10).map((r: { source: string; visitors: number }, i: number) => (
                  <div 
                    key={r?.source ?? i} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm truncate flex-1">{r?.source ?? 'Unknown'}</span>
                    <span className="text-sm font-medium text-muted-foreground ml-4">
                      {((r?.visitors ?? 0) as number).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Browsers</h2>
              <div className="space-y-2">
                {(browsers ?? []).slice(0, 10).map((b: { name: string; visitors: number }, i: number) => (
                  <div 
                    key={b?.name ?? i} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{b?.name ?? 'Unknown'}</span>
                    <span className="text-sm font-medium text-muted-foreground ml-4">
                      {((b?.visitors ?? 0) as number).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Operating Systems</h2>
              <div className="space-y-2">
                {(operating_systems ?? []).slice(0, 10).map((os: { name: string; visitors: number }, i: number) => (
                  <div 
                    key={os?.name ?? i} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{os?.name ?? 'Unknown'}</span>
                    <span className="text-sm font-medium text-muted-foreground ml-4">
                      {((os?.visitors ?? 0) as number).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Devices</h2>
              <div className="space-y-2">
                {(devices ?? []).slice(0, 10).map((d: { type: string; visitors: number }, i: number) => (
                  <div 
                    key={d?.type ?? i} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{d?.type ?? 'Unknown'}</span>
                    <span className="text-sm font-medium text-muted-foreground ml-4">
                      {((d?.visitors ?? 0) as number).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('WebTraffic page error:', error);
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Web Traffic</h1>
          <p className="text-muted-foreground">
            View web traffic data from Umami Analytics
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">
              Failed to load web traffic data: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
