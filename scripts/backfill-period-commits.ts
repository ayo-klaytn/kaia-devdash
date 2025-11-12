import dotenv from 'dotenv'
dotenv.config()
dotenv.config({ path: '.env.local' })

import { inArray, eq } from 'drizzle-orm'
import { differenceInSeconds } from 'date-fns'
import { createId } from '@paralleldrive/cuid2'

import db from '@/lib/db'
import { repository, commit as commitTable } from '@/lib/db/schema'
import { getCommitsWithDateRange } from './getCommitsWithDateRange'

type PeriodConfig = {
  remark: string
  from: string
  to?: string
}

const PERIODS: PeriodConfig[] = [
  { remark: 'klaytn-2022', from: '2022-01-01T00:00:00Z', to: '2022-12-31T23:59:59Z' },
  { remark: 'klaytn-2023', from: '2023-01-01T00:00:00Z', to: '2023-12-31T23:59:59Z' },
  { remark: 'klaytn-2024', from: '2024-01-01T00:00:00Z', to: '2024-08-31T23:59:59Z' },
  { remark: 'kaia-2024', from: '2024-09-01T00:00:00Z' },
]

const SLEEP_BETWEEN_REPOS_MS = 1000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const repos = await db
    .select({
      id: repository.id,
      owner: repository.owner,
      name: repository.name,
      remark: repository.remark,
    })
    .from(repository)
    .where(inArray(repository.remark, PERIODS.map((p) => p.remark)))

  if (repos.length === 0) {
    console.log('No repositories with configured period remarks found.')
    return
  }

  const reposByRemark = PERIODS.reduce<Record<string, typeof repos>>((acc, period) => {
    acc[period.remark] = repos.filter((repo) => repo.remark === period.remark)
    return acc
  }, {})

  for (const period of PERIODS) {
    const periodRepos = reposByRemark[period.remark]
    if (!periodRepos || periodRepos.length === 0) {
      console.log(`Skipping period ${period.remark} (no repos).`)
      continue
    }

    console.log(`\n=== Processing period: ${period.remark} (${periodRepos.length} repos) ===`)
    const fromDate = new Date(period.from)
    const toDate = period.to ? new Date(period.to) : undefined

    const startedAt = new Date()

    let processed = 0
    let totalCommits = 0
    let inserted = 0
    let skipped = 0
    let failed = 0
    let missingData = 0

    console.log('  Fetching existing commit SHAs for period repositories...')
    const existingRows = await db
      .select({ sha: commitTable.sha, repositoryId: commitTable.repositoryId })
      .from(commitTable)
      .where(inArray(commitTable.repositoryId, periodRepos.map((r) => r.id)))

    const existingByRepo = new Map<string, Set<string>>()
    for (const row of existingRows) {
      if (!row.sha) continue
      if (!existingByRepo.has(row.repositoryId)) {
        existingByRepo.set(row.repositoryId, new Set())
      }
      existingByRepo.get(row.repositoryId)!.add(row.sha)
    }

    for (const repo of periodRepos) {
      processed++
      const label = `${repo.owner}/${repo.name}`
      try {
        console.log(`[${processed}/${periodRepos.length}] Fetching commits for ${label}`)
        const commits = await getCommitsWithDateRange(
          repo.owner,
          repo.name,
          fromDate,
          toDate
        )
        console.log(`  → fetched ${commits.length} commits`)
        totalCommits += commits.length

        const existingSet = existingByRepo.get(repo.id) || new Set<string>()

        for (const commit of commits) {
          const payload = {
            repositoryId: repo.id,
            committerName:
              commit.commit.committer?.name ||
              commit.commit.author?.name ||
              null,
            committerEmail:
              commit.commit.committer?.email ||
              commit.commit.author?.email ||
              null,
            timestamp: commit.commit.committer?.date || commit.commit.author?.date,
            url: commit.html_url,
            sha: commit.sha,
            rawResponse: commit,
          }

          if (!payload.timestamp || !payload.committerEmail || !payload.sha) {
            missingData++
            continue
          }

          if (existingSet.has(payload.sha)) {
            skipped++
            continue
          }

          try {
            await db.insert(commitTable).values({
              id: createId(),
              repositoryId: payload.repositoryId,
              committerName: payload.committerName,
              committerEmail: payload.committerEmail,
              timestamp: payload.timestamp,
              url: payload.url,
              sha: payload.sha,
              rawResponse: payload.rawResponse as never,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            existingSet.add(payload.sha)
            inserted++
          } catch (err) {
            if (existingSet.has(payload.sha)) {
              skipped++
              continue
            }
            failed++
            console.error(`    ✖ Error inserting commit ${commit.sha}:`, err)
          }
        }
      } catch (err) {
        console.error(`  ✖ error processing ${label}:`, err)
      }

      await sleep(SLEEP_BETWEEN_REPOS_MS)
    }

    const finishedAt = new Date()
    const duration = differenceInSeconds(finishedAt, startedAt)

    console.log(
      `Finished ${period.remark}: repos=${periodRepos.length}, commits=${totalCommits}, inserted=${inserted}, skipped=${skipped}, missing=${missingData}, failed=${failed}, duration=${duration}s`
    )
  }

  console.log('\n✅ Period backfill completed.')
}

main().catch((err) => {
  console.error('Fatal error in backfill script:', err)
  process.exit(1)
})


