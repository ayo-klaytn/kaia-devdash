import kaia from "@/lib/mocks/kaia.json"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, GitCommitVertical, UserPen, Users, Calendar, LayoutGrid } from "lucide-react"
import { DataTable } from "@/app/dashboard/developers/[developer]/data-table"
import { columns } from "@/app/dashboard/developers/[developer]/columns"
import { DeveloperRepository } from "@/app/dashboard/developers/[developer]/columns"

export default async function Page({
  params,
}: {
  params: Promise<{ developer: string }>
}) {
  const { developer } = await params
  const ownedRepositories = kaia.repositories.filter(repo => repo.owner === developer)
  const contributedRepositories = kaia.repositories.filter(repo => repo.contributors.includes(developer))
  // from the kaia object filter the repositores that have the developer in the owner or contributors array
  const relatedRepositories = kaia.repositories.filter(repo => repo.owner === developer || repo.contributors.includes(developer))
  // construct a data array of the related repositories based on the type DeveloperRepository, for the relations field, if the repository is owned by the developer, then the relations should be "owner", if the repository is contributed to by the developer, then the relations should be "contributor", if the repository is both owned and contributed to by the developer, then the relations should be "both"
  const data: DeveloperRepository[] = relatedRepositories.map(repo => ({
    id: repo.id,
    owner: repo.owner,
    repository: repo.repository,
    relations: repo.owner === developer ? "owner" : repo.contributors.includes(developer) ? "contributor" : "both"
  }))

  const totalRepositoriesOfAccount = ownedRepositories.length + contributedRepositories.length
  const totalAuthoredRepositories = ownedRepositories.length
  const totalContributedRepositories = contributedRepositories.length

  // find 

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-2xl font-bold">{developer}</h1>
        <Button variant="outline" asChild>
          <Link target="_blank" href={`https://github.com/${developer}`}>
            <ExternalLink className="w-4 h-4" />
            <span>GitHub</span>
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link target="_blank" href={`https://x.com/${developer}`}>
            <ExternalLink className="w-4 h-4" />
            <span>X</span>
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{totalRepositoriesOfAccount} <span className="text-sm">repositories</span></h1>
          <div className="flex flex-row items-center gap-2">
            <UserPen className="w-4 h-4" />
            {totalAuthoredRepositories}
            <p className="text-sm">Authored</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Users className="w-4 h-4" />
            {totalContributedRepositories}
            <p className="text-sm">Contributed</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <GitCommitVertical className="w-4 h-4" />
            58
            <p className="text-sm">Commits</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">172 <span className="text-sm">days since first contribution</span></h1>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            8
            <p className="text-sm">days since last contribution</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">S <span className="text-sm">tier</span></h1>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            2
            <p className="text-sm">level 3 or above projects</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}