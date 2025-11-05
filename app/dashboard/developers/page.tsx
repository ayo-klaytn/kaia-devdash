//
import { MadProgressChart } from "@/app/dashboard/developers/mad-progress-chart"
import { YoYChart } from "@/app/dashboard/developers/yoy-chart"

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

    // Fetch YoY Active Developers for custom windows (longer timeout for complex query)
    let yoyData: {
      current: { from: string; to: string; activeDevelopers: number };
      previous: { from: string; to: string; activeDevelopers: number };
      yoyPercent: number | null;
    } = {
      current: { from: '', to: '', activeDevelopers: 0 },
      previous: { from: '', to: '', activeDevelopers: 0 },
      yoyPercent: null,
    };
    
    try {
      const yoyRes = await fetchWithTimeout(`${baseUrl}/api/view/active-developers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }, 30000); // 30 second timeout for this query
      
      if (yoyRes.ok) {
        yoyData = await yoyRes.json();
      }
    } catch (yoyError) {
      console.error('Error fetching YoY data (non-fatal):', yoyError);
      // Continue with default values - page will still load
    }
    
  // Log the data to see what we're getting
  console.log('Developers API response:', data);

  return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Developers</h1>
          <p className="text-sm text-muted-foreground">
            View developers and their metrics.
          </p>
        </div>

        {/* YoY Active Developers (custom windows) */}
        <div className="flex flex-col gap-3 border rounded-md p-4">
          <h2 className="text-xl font-semibold">Active Developers (YoY)</h2>
          <p className="text-xs text-muted-foreground">
            Sum of unique developers across rolling 30-day windows (MAD approach). Windows: 2023-08-28→2024-08-29 vs 2024-08-29→now
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border bg-muted/50">
                <th className="p-2 text-left">Window</th>
                <th className="p-2 text-left">Start → End</th>
                <th className="p-2 text-left">Active Developers</th>
                <th className="p-2 text-left">YoY</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border">
                <td className="p-2">Current</td>
                <td className="p-2">{new Date(yoyData.current.from).toISOString().slice(0,10)} → {new Date(yoyData.current.to).toISOString().slice(0,10)}</td>
                <td className="p-2">{yoyData.current.activeDevelopers.toLocaleString()}</td>
                <td className="p-2 font-medium">{yoyData.yoyPercent !== null ? `${yoyData.yoyPercent.toFixed(1)}%` : 'N/A'}</td>
              </tr>
              <tr className="border">
                <td className="p-2">Previous</td>
                <td className="p-2">{new Date(yoyData.previous.from).toISOString().slice(0,10)} → {new Date(yoyData.previous.to).toISOString().slice(0,10)}</td>
                <td className="p-2">{yoyData.previous.activeDevelopers.toLocaleString()}</td>
                <td className="p-2 text-muted-foreground">—</td>
              </tr>
            </tbody>
          </table>

          {/* YoY Comparison Mini Chart */}
          <div className="mt-3">
            <YoYChart
              current={yoyData.current.activeDevelopers || 0}
              previous={yoyData.previous.activeDevelopers || 0}
            />
          </div>
        </div>
        {/* Monthly Active Developers List */}
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h2 className="text-xl font-semibold">Monthly Active Developers (28d)</h2>
          <p className="text-sm text-muted-foreground">
            Developers who committed code in the last 28 days ({data.monthlyActiveDevelopers?.length || 0} total)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {data.monthlyActiveDevelopers?.map((dev: { email: string | null; name: string | null }, index: number) => {
              const displayName = dev.name || dev.email?.split('@')[0] || 'Unknown Developer';
              return (
                <div key={index} className="flex flex-col gap-1 p-2 border rounded text-sm">
                  <span className="font-medium">{displayName}</span>
                  <span className="text-muted-foreground text-xs">
                    Active in last 28 days
                  </span>
                </div>
              );
            }) || []}
          </div>
        </div>

        {/* New Developers List */}
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h2 className="text-xl font-semibold">New Developers (365d)</h2>
          <p className="text-sm text-muted-foreground">
            Developers whose first commit was within the last 365 days ({data.newDevelopers365d?.length || 0} total)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {data.newDevelopers365d?.map((dev: { email: string | null; name: string | null; firstAt: string }, index: number) => {
              const displayName = dev.name || dev.email?.split('@')[0] || 'Unknown Developer';
              return (
                <div key={index} className="flex flex-col gap-1 p-2 border rounded text-sm">
                  <span className="font-medium">{displayName}</span>
                  <span className="text-muted-foreground text-xs">
                    First commit: {dev.firstAt ? new Date(dev.firstAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
              );
            }) || []}
          </div>
        </div>

        {/* MAD Progress Chart - Always render */}
        <MadProgressChart 
          data={data.monthlyMadProgress || []} 
          uniqueDevelopersAcrossPeriod={data.uniqueDevelopersAcrossPeriod || 0}
          totalDeveloperMonths={data.totalDeveloperMonths || 0}
        />
      </div>
  );
}