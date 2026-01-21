import Link from "next/link";
import { Package, Users, GitCommit, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { columns } from "@/app/dashboard/github/columns";
import { DataTable } from "@/app/dashboard/github/data-table";
import { FullYearYoYTable, KaiaEraStrategicView } from "@/app/dashboard/github/yoy-views";
import { getGithubMetrics, GithubMetricsResponse } from "@/lib/services/github-metrics";

// GitHub metrics change slowly; we can safely cache page HTML for an hour
export const revalidate = 3600;

const PERIOD_LABELS: Record<string, string> = {
  "klaytn-2022": "2022",
  "klaytn-2023": "2023",
  "klaytn-2024": "2024 (Jan–Aug)",
  "kaia-2024": "Kaia Era (Sep 2024+)",
  "all": "All Periods",
};

const PERIOD_ORDER = ["kaia-2024", "klaytn-2024", "klaytn-2023", "klaytn-2022", "all"];

const DEFAULT_PERIOD = "kaia-2024";

export default async function GitHub({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ period?: string | string[] }>;
}) {
  const { period } = await searchParamsPromise;
  const periodParam = Array.isArray(period) ? period[0] : period;
  const periodId = PERIOD_LABELS[periodParam ?? ""] ? (periodParam as string) : DEFAULT_PERIOD;

  try {
    // Call shared service directly instead of doing an internal HTTP hop
    const metricsData: GithubMetricsResponse = await getGithubMetrics(periodId);

    const repositories = metricsData.repositories;
    const stats = {
      totalRepositories: metricsData.metrics.repositories,
      totalCommits: metricsData.metrics.commits,
      totalDevelopers: metricsData.metrics.developers,
      totalNewDevelopers: metricsData.metrics.newDevelopers,
    };

    const periodOptions = PERIOD_ORDER.filter((id) =>
      metricsData.availablePeriods.some((p) => p.id === id)
    ).map((id) => {
      const option = metricsData.availablePeriods.find((p) => p.id === id)!;
      return {
        id: option.id,
        label: option.label,
        href: `/dashboard/github?period=${option.id}`,
      };
    });

    const kpiCards = [
      {
        value: stats.totalRepositories,
        label: "Repositories",
        icon: Package,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50 dark:bg-blue-950/20",
        gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
      },
      {
        value: stats.totalCommits.toLocaleString(),
        label: "Commits",
        icon: GitCommit,
        iconColor: "text-green-600",
        iconBg: "bg-green-50 dark:bg-green-950/20",
        gradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
      },
      {
        value: stats.totalDevelopers.toLocaleString(),
        label: "Monthly Active Developers (MAD Sum)",
        icon: Users,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-50 dark:bg-purple-950/20",
        gradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
      },
      {
        value: stats.totalNewDevelopers.toLocaleString(),
        label: "New Developers",
        icon: Sparkles,
        iconColor: "text-orange-600",
        iconBg: "bg-orange-50 dark:bg-orange-950/20",
        gradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10",
      },
    ];

    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">GitHub</h1>
          <p className="text-muted-foreground">
            View ecosystem wide GitHub activities by period
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">About the MAD totals</p>
          <p>
            <span className="font-semibold text-foreground">Monthly Active Developers (MAD Sum)</span> adds up each
            calendar month&apos;s active developers within the selected period. This is the same definition used on the
            Developers page, so totals remain perfectly aligned across dashboards.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing data for <span className="font-medium text-foreground">{metricsData.period.label}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <Link
                key={option.id}
                href={option.href}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
                  option.id === metricsData.period.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background hover:bg-muted hover:border-primary/50"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Year-over-Year Analysis Views */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Year-over-Year Analysis</h2>
                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Remarks on comparison periods</p>
                  <p>
                    Jan–Aug 2024 is the final full window of the Klaytn era, while Kaia launched 29th August 2024. We
                    benchmark Kaia using Sept&nbsp;2024 onward so stakeholders can track the Kaia transition cleanly.
                    Once 2025 completes we can add new Kaia-era comparisons without reusing the Jan–Aug lens.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <FullYearYoYTable />
                <KaiaEraStrategicView />
              </div>
            </div>
        <div className="py-6">
          <DataTable columns={columns} data={repositories} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    
    // Determine error type for better user feedback
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        errorMessage = 'Request timed out. The query is taking longer than expected. This may happen on first load. Please try again - subsequent loads should be faster due to caching.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">GitHub</h1>
          <p className="text-muted-foreground">View ecosystem wide GitHub activities</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <span className="font-semibold text-destructive">Error loading GitHub data</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
            <Link 
              href="/dashboard/github" 
              className="inline-block px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium text-sm"
            >
              Retry
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}