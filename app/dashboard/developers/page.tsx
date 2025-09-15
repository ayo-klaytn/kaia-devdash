import { Users } from "lucide-react";
import { MadProgressChart } from "@/app/dashboard/developers/mad-progress-chart"

export const dynamic = 'force-dynamic'

export default async function DevelopersPage() {
  // Get the base URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';

  try {
    const response = await fetch(`${baseUrl}/api/view/developers?page=1&limit=1000`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!
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

        {/* MAD Progress Chart */}
        {data.monthlyMadProgress && data.monthlyMadProgress.length > 0 && (
          <MadProgressChart 
            data={data.monthlyMadProgress} 
            uniqueDevelopersAcrossPeriod={data.uniqueDevelopersAcrossPeriod || 0}
            totalDeveloperMonths={data.totalDeveloperMonths || 0}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching developers data:', error);
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Developers</h1>
          <p className="text-sm text-muted-foreground">
            View developers and their metrics.
          </p>
        </div>
        <div className="border rounded-md p-4 text-red-600">
          Error loading developers data: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }
}