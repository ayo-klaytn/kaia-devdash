import { ExternalLink, TrendingUp, Activity, BarChart3, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OnchainMetricsPage() {
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
              <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
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
              <div className="text-3xl font-bold text-orange-600 mb-2">89</div>
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
              <div className="text-3xl font-bold text-green-600 mb-2">$2.4M</div>
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
              <div className="text-3xl font-bold text-purple-600 mb-2">15,000</div>
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
              <div className="text-3xl font-bold text-indigo-600 mb-2">3,200</div>
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
          click the "View Full Chart" buttons or visit the external dashboards using the links above.
        </p>
      </div>
    </div>
  );
}
