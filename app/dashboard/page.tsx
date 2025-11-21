import { Package, UserPen, Users, GitBranch, Eye, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';

  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 20000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  // Fetch only Umami-derived metrics for performance, with graceful fallback
  let visits30d = 0;
  let views30d = 0;
  try {
    const traffic30Res = await fetchWithTimeout(`${baseUrl}/api/data/web-traffic?days=30`);
    const traffic30 = traffic30Res.ok ? await traffic30Res.json() : {};

    visits30d = Number(traffic30?.overview?.visits?.value || 0);
    views30d = Number(traffic30?.overview?.views?.value || 0);
  } catch {
    // keep defaults (0) on timeout/abort
  }

  // Hardcoded quick metrics to avoid extra API latency
  const monthlyActiveDevs = 57;
  const newDevelopers365 = 180;
  const repositoriesCount = 161;
  const activeContracts = 1247;

  const kpiCards = [
    {
      value: monthlyActiveDevs,
      label: "Monthly Active Developers",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
    },
    {
      value: newDevelopers365,
      label: "New Developers",
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-950/20",
      gradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
    },
    {
      value: repositoriesCount,
      label: "Repositories",
      icon: GitBranch,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/20",
      gradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
    },
    {
      value: views30d,
      label: "Views",
      icon: Eye,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50 dark:bg-orange-950/20",
      gradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10",
    },
    {
      value: visits30d,
      label: "Visits",
      icon: UserPen,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/20",
      gradient: "from-cyan-50 to-cyan-100/50 dark:from-cyan-950/20 dark:to-cyan-900/10",
    },
    {
      value: activeContracts,
      label: "Active Contracts",
      icon: Package,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/20",
      gradient: "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10",
    },
  ];

  const majorLeads = [
    "Technical Content Rollout",
    "Bootcamps and Dev Bounties",
    "KR Stablecoin Hackathon",
    "Kaia Wave Stablecoin Summer Hackathon",
    "Tech upgrades and rollouts",
    "Global Events and Activations (e.g Kaia Chinese Tour)",
  ];

  const majorLags = [
    { text: `${newDevelopers365.toLocaleString()} New Developers (365d)`, value: newDevelopers365 },
    { text: `${visits30d.toLocaleString()} Visits / Month`, value: visits30d },
    { text: `${monthlyActiveDevs.toLocaleString()} active developers (28d)`, value: monthlyActiveDevs },
    { text: `${activeContracts.toLocaleString()} active contracts / month`, value: activeContracts },
    { text: "5 active products launched", value: null, strikethrough: true },
  ];

  return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Summary of North Star metrics
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index}
                className="relative overflow-hidden border-0 shadow-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{card.label}</p>
                      <h2 className="text-3xl font-bold tracking-tight">{card.value.toLocaleString()}</h2>
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

        {/* Major Leads & Lags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Major Leads</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                What did we do to influence the major outcomes
              </p>
              <ul className="space-y-2">
                {majorLeads.map((lead, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{lead}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Major Lags</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The major outcomes
              </p>
              <ul className="space-y-2">
                {majorLags.map((lag, index) => (
                  <li 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                    <span className={`text-sm flex-1 ${lag.strikethrough ? 'line-through text-muted-foreground' : ''}`}>
                      {lag.text}
                    </span>
                    {lag.value !== null && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {lag.value.toLocaleString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )
}