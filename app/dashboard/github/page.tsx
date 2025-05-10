// import kaia from "@/lib/mocks/kaia.json"
import { Package, UserPen, Users } from "lucide-react";
import { columns } from "@/app/dashboard/github/columns"
import { DataTable } from "@/app/dashboard/github/data-table"


export default async function GitHub() {

  const response = await fetch("http://localhost:3006/api/view/github?page=1&limit=1000&status=active", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  })
  const data = await response.json()

  const repositories = data.repositories

  const stats = {
    totalRepositories: data.numberOfRepositories,
    totalContributors: data.numberOfContributors,
    totalAuthors: data.numberOfAuthors,
  }


  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">GitHub</h1>
        <p className="text-sm text-muted-foreground">
          View ecosystem wide GitHub activities.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <h1 className="text-2xl font-bold">{stats.totalContributors}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Contributors</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={repositories} />
      </div>
    </div>
    
  )
}