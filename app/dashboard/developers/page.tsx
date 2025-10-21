//
import { MadProgressChart } from "@/app/dashboard/developers/mad-progress-chart"

export const dynamic = 'force-dynamic'

export default async function DevelopersPage() {
  // Resolve absolute base URL from headers at runtime
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : '';

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
    const response = await fetchWithTimeout(`${baseUrl}/api/view/developers?page=1&limit=200`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
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
  } catch (error) {
    console.error('Error fetching developers data:', error);
    
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
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Developers</h1>
          <p className="text-sm text-muted-foreground">
            View developers and their metrics.
          </p>
        </div>
        <div className="border rounded-md p-4 text-red-600 bg-red-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">Error loading developers data</span>
          </div>
          <p className="mt-2 text-sm">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}