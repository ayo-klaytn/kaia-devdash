import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, GitCommitVertical, UserPen, Users, Calendar, LayoutGrid } from "lucide-react"
// import { DataTable } from "@/app/dashboard/developers/[developer]/data-table"
// import { columns } from "@/app/dashboard/developers/[developer]/columns"
import NotFoundComponent from "@/components/notfound"

export const dynamic = 'force-dynamic'

type Params = Promise<{ developer: string }>

export default async function Page({
  params,
}: {
  params: Params
}) {
  const { developer } = await params
  
  const developerResponse = await fetch(`http://localhost:3006/api/view/developer?name=${developer}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  })

  const developerData = await developerResponse.json()


  if (!developerData) {
    return <NotFoundComponent />
  }


  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-2xl font-bold">{developerData.name}</h1>
        <Button variant="outline" asChild>
          <Link target="_blank" href={`https://github.com/${developerData.name}`}>
            <ExternalLink className="w-4 h-4" />
            <span>GitHub</span>
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link target="_blank" href={`https://x.com/${developerData?.x_handle}`}>
            <ExternalLink className="w-4 h-4" />
            <span>X</span>
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{developerData.id}</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{developerData.totalRepositoriesOfAccount} <span className="text-sm">repositories</span></h1>
          <div className="flex flex-row items-center gap-2">
            <UserPen className="w-4 h-4" />
            {developerData.totalAuthoredRepositories}
            <p className="text-sm">Authored</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Users className="w-4 h-4" />
            {developerData.totalContributedRepositories}
            <p className="text-sm">Contributed</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <GitCommitVertical className="w-4 h-4" />
            {developerData.totalCommits}
            <p className="text-sm">Commits</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{Math.floor((Date.now() - new Date(developerData.firstCommitDate).getTime()) / (1000 * 60 * 60 * 24))} <span className="text-sm">days since first contribution</span></h1>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {Math.floor((Date.now() - new Date(developerData.lastCommitDate).getTime()) / (1000 * 60 * 60 * 24))}
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
      {/* <div className="container mx-auto py-10">
        <DataTable columns={columns} data={developerData.repositories} />
      </div> */}
    </div>
  )
}