import { Package, UserPen, Users } from "lucide-react";
import { columns } from "@/app/dashboard/github/columns"
import { DataTable } from "@/app/dashboard/github/data-table"

export const dynamic = 'force-dynamic'

export default async function GitHub() {
  // Get the base URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';

  // Fetch GitHub data
  const githubResponse = await fetch(`${baseUrl}/api/view/github?page=1&limit=1000&status=active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  })
  const githubData = await githubResponse.json()

  // Fetch developers data for MAD and New Developers
  const developersResponse = await fetch(`${baseUrl}/api/view/developers?page=1&limit=1000`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  })
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
}