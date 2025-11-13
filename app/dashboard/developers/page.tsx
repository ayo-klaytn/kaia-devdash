//
import { MadProgressChart } from "@/app/dashboard/developers/mad-progress-chart"
import { MultiYearDeveloperMetrics } from "@/app/dashboard/developers/multi-year-developer-metrics"
import { DeveloperDemographics } from "@/app/dashboard/developers/developer-demographics"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Sparkles } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DevelopersPage() {
  // Resolve absolute base URL from headers at runtime
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';

  // Add timeout for API calls
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 20000) => {
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

  // Default-safe data shape in case API is slow or unavailable
  type DevelopersData = {
    numberOfDevelopers: number;
    numberOfActiveMonthlyDevelopers: number;
    monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }>;
    newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }>;
    monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }>;
    uniqueDevelopersAcrossPeriod: number;
    totalDeveloperMonths: number;
    developers: unknown[];
  };

  let data: DevelopersData = {
    numberOfDevelopers: 0,
    numberOfActiveMonthlyDevelopers: 0,
    monthlyActiveDevelopers: [],
    newDevelopers365d: [],
    monthlyMadProgress: [],
    uniqueDevelopersAcrossPeriod: 0,
    totalDeveloperMonths: 0,
    developers: []
  };

  // Fetch main developers data, but don't fail the page on error/timeout
  try {
    const response = await fetchWithTimeout(
      `${baseUrl}/api/view/developers?page=1&limit=200`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
      20000
    );
    if (response.ok) {
      data = await response.json();
    }
  } catch (e) {
    console.error('Developers API fetch (non-fatal):', e);
  }

  // Log the data to see what we're getting
  console.log('Developers API response:', data);

  return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
          <p className="text-muted-foreground">
            View developers and their metrics
          </p>
        </div>

        {/* YoY Active Developers (custom windows) */}
        <MultiYearDeveloperMetrics />
        
        {/* Monthly Active Developers List */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Monthly Active Developers (28d)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Developers who committed code in the last 28 days ({data.monthlyActiveDevelopers?.length || 0} total)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {data.monthlyActiveDevelopers?.map((dev: { email: string | null; name: string | null }, index: number) => {
                const displayName = dev.name || dev.email?.split('@')[0] || 'Unknown Developer';
                return (
                  <div 
                    key={index} 
                    className="flex flex-col gap-1 p-3 rounded-lg border hover:bg-muted/50 transition-colors hover:shadow-sm"
                  >
                    <span className="font-medium text-sm">{displayName}</span>
                    <span className="text-muted-foreground text-xs">
                      Active in last 28 days
                    </span>
                  </div>
                );
              }) || []}
            </div>
          </CardContent>
        </Card>

        {/* New Developers List */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">New Developers (365d)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Developers whose first commit was within the last 365 days ({data.newDevelopers365d?.length || 0} total)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {data.newDevelopers365d?.map((dev: { email: string | null; name: string | null; firstAt: string }, index: number) => {
                const displayName = dev.name || dev.email?.split('@')[0] || 'Unknown Developer';
                return (
                  <div 
                    key={index} 
                    className="flex flex-col gap-1 p-3 rounded-lg border hover:bg-muted/50 transition-colors hover:shadow-sm"
                  >
                    <span className="font-medium text-sm">{displayName}</span>
                    <span className="text-muted-foreground text-xs">
                      First commit: {dev.firstAt ? new Date(dev.firstAt).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                );
              }) || []}
            </div>
          </CardContent>
        </Card>

        {/* MAD Progress Chart - Always render */}
        <MadProgressChart 
          data={data.monthlyMadProgress || []} 
          uniqueDevelopersAcrossPeriod={data.uniqueDevelopersAcrossPeriod || 0}
          totalDeveloperMonths={data.totalDeveloperMonths || 0}
        />

        {/* Developer Demographics */}
        <DeveloperDemographics />
      </div>
  );
}