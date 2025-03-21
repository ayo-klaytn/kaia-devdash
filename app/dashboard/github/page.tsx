import { Skeleton } from "@/components/ui/skeleton"
import kaia from "@/lib/mocks/kaia.json"
import { Package, UserPen, Users } from "lucide-react";
import { Repository, columns } from "@/app/dashboard/github/columns"
import { DataTable } from "@/app/dashboard/github/data-table"

export default function GitHub() {

  const totalRepositories = kaia.repositories.length
  
  // count number of unique owners
  const uniqueOwners = new Set(kaia.repositories.map(repo => repo.owner))
  const totalAuthors = uniqueOwners.size

  // count number of unique contributors
  const uniqueContributors = new Set(kaia.repositories.flatMap(repo => repo.contributors))
  const totalContributors = uniqueContributors.size

  const data: Repository[] = kaia.repositories

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
          <h1 className="text-2xl font-bold">{totalRepositories}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Repositories</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{totalAuthors}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Authors</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{totalContributors}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Contributors</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
    
  )
}