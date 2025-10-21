import { Package, UserPen, Users } from "lucide-react";
import { columns } from "@/app/dashboard/github/columns"
import { DataTable } from "@/app/dashboard/github/data-table"

export const dynamic = 'force-dynamic'

export default async function GitHub() {
  // Resolve absolute base URL from headers
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
    // Fetch GitHub data
    const githubResponse = await fetchWithTimeout(`${baseUrl}/api/view/github?page=1&limit=200&status=active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    if (!githubResponse.ok) {
      throw new Error(`GitHub API call failed: ${githubResponse.status} ${githubResponse.statusText}`)
    }
    const githubData = await githubResponse.json()

    // Fetch developers data for MAD and New Developers
    const developersResponse = await fetchWithTimeout(`${baseUrl}/api/view/developers?page=1&limit=200`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
    if (!developersResponse.ok) {
      throw new Error(`Developers API call failed: ${developersResponse.status} ${developersResponse.statusText}`)
    }
    const developersData = await developersResponse.json()

    const repositories = githubData.repositories

    const stats = {
      totalRepositories: githubData.numberOfRepositories,
      totalContributors: githubData.numberOfContributors,
      totalAuthors: githubData.numberOfAuthors,
      totalActiveDevelopers: developersData.numberOfActiveMonthlyDevelopers,
      totalNewDevelopers: developersData.newDevelopers365d.length,
    }

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">GitHub</h1>
          <p className="text-sm text-muted-foreground">
            View ecosystem wide GitHub activities.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{stats.totalRepositories}</h1>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <p className="text-sm">Repositories</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{stats.totalAuthors}</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Authors</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{stats.totalActiveDevelopers}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Active Developers (28d)</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{stats.totalNewDevelopers}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">New Developers (365d)</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-10">
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
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">GitHub</h1>
          <p className="text-sm text-muted-foreground">
            View ecosystem wide GitHub activities.
          </p>
        </div>
        <div className="border rounded-md p-4 text-red-600 bg-red-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">Error loading GitHub data</span>
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