import kaia from "@/lib/mocks/kaia.json"

export default async function Page({
  params,
}: {
  params: Promise<{ account: string }>
}) {
  const { account } = await params
  const ownedRepositories = kaia.repositories.filter(repo => repo.owner === account)
  const contributedRepositories = kaia.repositories.filter(repo => repo.contributors.includes(account))

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Repositories</h1>
      <div>
        <h2>Owned</h2>
        <ul>
          {ownedRepositories.map(repo => <li key={repo.id}>{repo.repository}</li>)}
        </ul>
      </div>
      <div>
        <h2>Contributed</h2>
        <ul>
          {contributedRepositories.map(repo => <li key={repo.id}>{repo.repository}</li>)}
        </ul>
      </div>
    </div>
  )
}