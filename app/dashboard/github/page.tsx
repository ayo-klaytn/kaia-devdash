import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, Users, GitCommit, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { columns, RepositoryRow } from "@/app/dashboard/github/columns";
import { DataTable } from "@/app/dashboard/github/data-table";

export const dynamic = 'force-dynamic'

const PERIOD_LABELS: Record<string, string> = {
  "klaytn-2022": "2022",
  "klaytn-2023": "2023",
  "klaytn-2024": "2024 (Jan–Aug)",
  "kaia-2024": "Kaia Era (Sep 2024+)",
  "all": "All Periods",
};

const PERIOD_ORDER = ["kaia-2024", "klaytn-2024", "klaytn-2023", "klaytn-2022", "all"];

type GithubMetricsResponse = {
  period: {
    id: string;
    label: string;
    brand: "klaytn" | "kaia";
    start: string;
    end: string | null;
  };
  availablePeriods: Array<{
    id: string;
    label: string;
    brand: "klaytn" | "kaia";
  }>;
  metrics: {
    repositories: number;
    commits: number;
    developers: number;
    newDevelopers: number;
  };
  repositories: RepositoryRow[];
};

const DEFAULT_PERIOD = "kaia-2024";

export default async function GitHub({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ period?: string | string[] }>;
}) {
  // Resolve absolute base URL from headers
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';

  const { period } = await searchParamsPromise;
  const periodParam = Array.isArray(period) ? period[0] : period;

  const periodId = PERIOD_LABELS[periodParam ?? ""] ? periodParam! : DEFAULT_PERIOD;

  // Add timeout for API calls
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    // Fetch current period metrics
    const metricsRes = await fetchWithTimeout(
      `${baseUrl}/api/view/github-metrics?period=${encodeURIComponent(periodId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      20000
    );

    if (!metricsRes.ok) {
      if (metricsRes.status === 404) {
        notFound();
      }
      throw new Error(`GitHub metrics API call failed: ${metricsRes.status} ${metricsRes.statusText}`);
    }

    const metricsData = (await metricsRes.json()) as GithubMetricsResponse;

    // Fetch all periods for YoY comparison (in chronological order)
    const allPeriodsData: Array<{ period: string; periodId: string; developers: number; yoyPercent: number | null }> = [];
    const periodsToFetch = ["klaytn-2022", "klaytn-2023", "klaytn-2024", "kaia-2024"];
    
    for (const period of periodsToFetch) {
      try {
        const periodRes = await fetchWithTimeout(
          `${baseUrl}/api/view/github-metrics?period=${encodeURIComponent(period)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
          10000
        );
        
        if (periodRes.ok) {
          const periodData = (await periodRes.json()) as GithubMetricsResponse;
          allPeriodsData.push({
            period: periodData.period.label,
            periodId: periodData.period.id,
            developers: periodData.metrics.developers,
            yoyPercent: null, // Will calculate below
          });
        }
      } catch (e) {
        console.error(`Error fetching period ${period}:`, e);
        // Continue with other periods
      }
    }

    // Sort by period order (chronological: 2022 -> 2023 -> 2024 -> Kaia)
    allPeriodsData.sort((a, b) => {
      const order = ["klaytn-2022", "klaytn-2023", "klaytn-2024", "kaia-2024"];
      return order.indexOf(a.periodId) - order.indexOf(b.periodId);
    });

    // Calculate YoY percentages (comparing each year to the previous year)
    for (let i = 1; i < allPeriodsData.length; i++) {
      const current = allPeriodsData[i];
      const previous = allPeriodsData[i - 1];
      if (previous.developers > 0) {
        current.yoyPercent = ((current.developers - previous.developers) / previous.developers) * 100;
      } else if (current.developers > 0) {
        current.yoyPercent = 100; // Infinite growth from zero
      }
    }

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
        label: "Unique Developers",
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

        {/* YoY Progress Cards */}
        {allPeriodsData.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Year-over-Year Progress</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {allPeriodsData.map((periodData, index) => (
                <Card 
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-sm font-semibold truncate flex-1">{periodData.period}</h3>
                      {periodData.yoyPercent !== null && (
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${
                            periodData.yoyPercent >= 0 
                              ? "text-green-600 bg-green-50 dark:bg-green-950/30" 
                              : "text-red-600 bg-red-50 dark:bg-red-950/30"
                          }`}
                        >
                          {periodData.yoyPercent > 0 ? "+" : ""}
                          {periodData.yoyPercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <p className="text-2xl font-bold">{periodData.developers.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Unique Developers</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
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
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
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