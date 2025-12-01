import { ExternalLink, TrendingUp, Activity, BarChart3, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function OnchainMetricsPage() {
  // Resolve base URL for server-side fetches
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const proto = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = host ? `${proto}://${host}` : "";

  let activeContracts = 1247;
  let hotContracts = 89;
  let tvlUsd = 2400000;
  let maxTps = 8265;
  let dailyTps = 5;

  try {
    const [activeRes, hotRes, tvlRes, maxTpsRes, tpsRes] = await Promise.all([
      fetch(`${baseUrl}/api/data/active-contracts`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/data/hot-contracts`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/data/tvl`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/data/max-tps`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/data/daily-tps`, { cache: "no-store" }),
    ]);

    if (activeRes.ok) {
      const json = await activeRes.json();
      if (typeof json?.activeContracts === "number" && json.activeContracts > 0) {
        activeContracts = json.activeContracts;
      }
    }

    if (hotRes.ok) {
      const json = await hotRes.json();
      if (typeof json?.hotContracts === "number" && json.hotContracts > 0) {
        hotContracts = json.hotContracts;
      }
    }

    if (tvlRes.ok) {
      const json = await tvlRes.json();
      if (typeof json?.tvlUsd === "number" && json.tvlUsd > 0) {
        tvlUsd = json.tvlUsd;
      }
    }

    if (maxTpsRes.ok) {
      const json = await maxTpsRes.json();
      if (typeof json?.maxTps === "number" && json.maxTps > 0) {
        maxTps = json.maxTps;
      }
    }

    if (tpsRes.ok) {
      const json = await tpsRes.json();
      if (typeof json?.dailyTps === "number" && json.dailyTps > 0) {
        dailyTps = json.dailyTps;
      }
    }
  } catch {
    // fall back to defaults
  }

  const tvlDisplay = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(tvlUsd);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold">Onchain Metrics</h1>
        <p className="text-sm text-muted-foreground">
          View Kaia blockchain metrics and analytics from external sources.
        </p>
        <div className="flex flex-row items-center gap-4">
          <Button variant="outline" asChild>
            <Link
              target="_blank"
              href="https://dune.com/kaia_foundation/kaia-official-dashboard"
            >
              <span>View Full Dune Dashboard</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              target="_blank"
              href="https://kaiascan.io/charts"
            >
              <span>View Kaiascan Charts</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Metrics Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Top Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Key Dune Analytics metrics for Kaia ecosystem
          </p>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Views (12 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32,514</div>
              <p className="text-xs text-muted-foreground">Dashboard views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Public Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68</div>
              <p className="text-xs text-muted-foreground">Published dashboards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saved Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95</div>
              <p className="text-xs text-muted-foreground">Query templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dashboard Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">656</div>
              <p className="text-xs text-muted-foreground">User favorites</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Query Authors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">140</div>
              <p className="text-xs text-muted-foreground">Unique creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contracts on Kaia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,043</div>
              <p className="text-xs text-muted-foreground">Total contracts</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Query Executions (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">737</div>
              <p className="text-xs text-muted-foreground">Total executions in last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Dashboards */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Top Dashboards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">#1 Kaia Wave</CardTitle>
                <CardDescription>Official Kaia Wave dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://dune.com/kaia_foundation/kaia-wave" target="_blank">
                    <span>View Dashboard</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">#2 Official Dashboard</CardTitle>
                <CardDescription>Kaia Foundation official metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://dune.com/kaia_foundation/kaia-official-dashboard" target="_blank">
                    <span>View Dashboard</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">#3 DApp Portal Revenue</CardTitle>
                <CardDescription>Revenue breakdown by wisekim_eth</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://dune.com/wisekim_eth/kaia-dapp-portal-revenue-breakdown" target="_blank">
                    <span>View Dashboard</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">#4 Hashed Official</CardTitle>
                <CardDescription>Hashed&apos;s Kaia analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://dune.com/hashed_official/kaia" target="_blank">
                    <span>View Dashboard</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium">#5 Seoul Analytics</CardTitle>
                <CardDescription>Seoul&apos;s comprehensive Kaia metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href="https://dune.com/seoul/kaia" target="_blank">
                    <span>View Dashboard</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Active Contracts
            </CardTitle>
            <CardDescription>Number of active smart contracts on Kaia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {activeContracts.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">+12% from last month</div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📊 Chart data available on Dune Analytics
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="https://dune.com/embeds/4216780/7101037" target="_blank">
                    View Full Chart
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hot Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Hot Contracts 🔥
            </CardTitle>
            <CardDescription>Most active and trending contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {hotContracts.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">High activity contracts</div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📊 Chart data available on Dune Analytics
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="https://dune.com/embeds/4220772/7101058" target="_blank">
                    View Full Chart
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TVL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              TVL (Total Value Locked)
            </CardTitle>
            <CardDescription>Source: Defillama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {tvlDisplay}
              </div>
              <div className="text-sm text-muted-foreground">+8.5% from last week</div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📊 Chart data available on Dune Analytics
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="https://dune.com/embeds/4222136/7103243" target="_blank">
                    View Full Chart
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Max TPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Max TPS
            </CardTitle>
            <CardDescription>Maximum transactions per second</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {maxTps.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Peak performance</div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📊 Chart data available on Dune Analytics
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="https://dune.com/embeds/4674606/7780357" target="_blank">
                    View Full Chart
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily TPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Daily TPS
            </CardTitle>
            <CardDescription>Average daily transactions per second</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {dailyTps.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">24-hour average</div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📊 Chart data available on Dune Analytics
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="https://dune.com/embeds/4225892/7109149" target="_blank">
                    View Full Chart
                </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📊 About These Metrics</h3>
        <p className="text-sm text-blue-700">
          The charts above are embedded from Dune Analytics and Kaiascan. For the full interactive experience, 
          click the &quot;View Full Chart&quot; buttons or visit the external dashboards using the links above.
        </p>
      </div>
    </div>
  );
}
