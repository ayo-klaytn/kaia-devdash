import Link from "next/link";
import { contributor as ContributorSchema, commit as CommitSchema } from "@/lib/db/schema";

export default async function RepositoryPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const response = await fetch(`http://localhost:3006/api/view/repository?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apiSecret': process.env.API_SECRET!
    }
  })
  const data = await response.json()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{data.repository.name}</h1>
        <p className="text-sm text-muted-foreground">
          ID: {data.repository.id}
        </p>
        <p className="text-sm text-muted-foreground">
          URL: <a className="text-blue-500 underline underline-offset-4" href={data.repository.url} target="_blank" rel="noopener noreferrer">{data.repository.url}</a>
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Owner</p>
            <p className="text-sm">{data.repository.owner}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm">{data.repository.name}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm">{data.repository.status.charAt(0).toUpperCase() + data.repository.status.slice(1)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Remarks</p>
            <p className="text-sm">{data.repository.remark.charAt(0).toUpperCase() + data.repository.remark.slice(1)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Created at</p>
            <p className="text-sm">{new Date(data.repository.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Updated at</p>
            <p className="text-sm">{new Date(data.repository.updatedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Contributors (Total: {data.contributors.length})</h2>
        <div className="flex flex-wrap gap-2">
          {data.contributors.map((contributor: typeof ContributorSchema.$inferSelect) => (
            <div key={contributor.id} className="bg-muted rounded-md p-2">
              <Link className="text-sm underline underline-offset-4 text-blue-500" href={`/dashboard/developers/${contributor.id}`}>{contributor.username}</Link>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Commits (Total: {data.commits.length})</h2>
        <div className="flex flex-col gap-2">
          {data.commits.map((commit: typeof CommitSchema.$inferSelect) => (
            <a key={commit.id} className="text-sm underline underline-offset-4 text-blue-500" target="_blank" rel="noopener noreferrer" href={commit.url || '#'}>{commit.url || 'No URL'}</a>
          ))}
        </div>
      </div>
    </div>
  );
}