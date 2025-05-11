import { Package, UserPen, Users } from "lucide-react";
import { columns } from "@/app/dashboard/developers/columns"
import { DataTable } from "@/app/dashboard/developers/data-table"

export default async function DevelopersPage() {

  const response = await fetch("http://localhost:3006/api/view/developers?page=1&limit=1000", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!
    }
  });

  const data = await response.json();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Developers</h1>
        <p className="text-sm text-muted-foreground">
          View developers and their metrics.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.numberOfDevelopersWithMoreThan3Repositories}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Authors with more than 3 repositories</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.developersWithAtLeast1Rank3Repository}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Developers with at least 1 rank 3 repo</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.developersWithNftBadges}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Developers with NFT badges</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.numberOfDevelopersGraduatedBootcamp}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Developers graduating bootcamp</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.numberOfDevelopersGraduatedBootcampAndContributed}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Devs graduating bootcamp turned contributors</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.developersWithAtLeast1RepoWithAtLeast3Stars}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Devs with at least 1 repo with at least 3 stars</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.numberOfDevelopers}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Total developers</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.numberOfDevelopersWithCommunityRankMoreThan3}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Developers with community rank more than 3</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{data.numberOfActiveMonthlyDevelopers}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Monthly active developers</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data.developers} />
      </div>
    </div>
  );
}
