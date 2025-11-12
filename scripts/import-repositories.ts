import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createId } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'

import db from '@/lib/db'
import { repository } from '@/lib/db/schema'

type RepoCatalogRecord = {
  owner: string
  name: string | null
  url: string
  type: 'repo' | 'org'
  sources: Array<{
    program: string
    brand: 'klaytn' | 'kaia'
    periodStart?: string
    periodEnd?: string
    notes?: string
  }>
}

const PROGRAM_REMARK_MAP: Record<string, string> = {
  'klaymakers-2022': 'klaytn-2022',
  'klaymakers-2023': 'klaytn-2023',
  'klaymakers-2024': 'klaytn-2024',
  'kaia-2024-bounties': 'kaia-2024',
  'kaia-core': 'kaia-core',
  'klaytn-core': 'klaytn-core',
  'electric-capital': 'ecosystem-electric-capital',
  'kr-stablecoin-hackathon': 'kaia-2024-stablecoin',
  'bootcamp': 'kaia-bootcamp-2024',
  'kwssh': 'kaia-kwssh-2024',
}

const BRAND_PRIORITY: Record<'klaytn' | 'kaia', number> = {
  klaytn: 1,
  kaia: 2,
}

function resolveRemark(record: RepoCatalogRecord): string {
  if (record.sources.length === 0) {
    return 'external'
  }

  const sorted = [...record.sources].sort((a, b) => {
    const brandDiff = BRAND_PRIORITY[b.brand] - BRAND_PRIORITY[a.brand]
    if (brandDiff !== 0) {
      return brandDiff
    }

    const dateA = a.periodStart ? Date.parse(a.periodStart) : 0
    const dateB = b.periodStart ? Date.parse(b.periodStart) : 0
    if (dateA !== dateB) {
      return dateB - dateA
    }

    return a.program.localeCompare(b.program)
  })

  for (const source of sorted) {
    const remark = PROGRAM_REMARK_MAP[source.program]
    if (remark) {
      return remark
    }
  }

  return `${sorted[0].brand}-${sorted[0].program}`
}

async function main() {
  const catalogPath = path.join(process.cwd(), 'lib', 'mocks', 'repo-catalog.generated.json')
  if (!fs.existsSync(catalogPath)) {
    console.error('❌ repo-catalog.generated.json not found. Run generate-repo-catalog.ts first.')
    process.exit(1)
  }

  const raw = fs.readFileSync(catalogPath, 'utf8')
  const catalog = JSON.parse(raw) as RepoCatalogRecord[]

  const repos = catalog.filter((item) => item.type === 'repo' && item.name)

  console.log(`Processing ${repos.length} repository entries (skipping org-only URLs).`)

  const existingRows = await db
    .select({
      id: repository.id,
      owner: repository.owner,
      name: repository.name,
      remark: repository.remark,
      url: repository.url,
      status: repository.status,
    })
    .from(repository)

  const existingMap = new Map<string, (typeof existingRows)[number]>()
  for (const row of existingRows) {
    existingMap.set(`${row.owner}/${row.name}`, row)
  }

  let inserted = 0
  let updated = 0
  const now = new Date()

  for (const repoRecord of repos) {
    const name = repoRecord.name!
    const key = `${repoRecord.owner}/${name}`
    const remark = resolveRemark(repoRecord)
    const url = repoRecord.url

    if (existingMap.has(key)) {
      const existing = existingMap.get(key)!
      const shouldUpdate =
        existing.remark !== remark ||
        existing.url !== url ||
        existing.status !== 'active'

      if (shouldUpdate) {
        await db
          .update(repository)
          .set({
            remark,
            url,
            status: 'active',
            updatedAt: now,
          })
          .where(eq(repository.id, existing.id))

        updated++
        console.log(`  updated: ${key} -> ${remark}`)
      } else {
        console.log(`  unchanged: ${key}`)
      }
    } else {
      await db.insert(repository).values({
        id: createId(),
        owner: repoRecord.owner,
        name,
        url,
        status: 'active',
        remark,
        createdAt: now,
        updatedAt: now,
      })

      inserted++
      console.log(`  inserted: ${key} -> ${remark}`)
    }
  }

  console.log('\n✅ Repository import complete.')
  console.log(`Inserted: ${inserted}`)
  console.log(`Updated:  ${updated}`)
  console.log(`Skipped org-only entries: ${catalog.length - repos.length}`)
}

main().catch((err) => {
  console.error('Error importing repositories:', err)
  process.exit(1)
})


