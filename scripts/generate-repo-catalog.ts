import 'dotenv/config'
import fs from 'fs'
import path from 'path'

interface SourceConfig {
  file: string
  program: string
  brand: 'klaytn' | 'kaia'
  periodStart?: string
  periodEnd?: string
  notes?: string
}

interface RepoRecord {
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

const ROOT = process.cwd()

const SOURCES: SourceConfig[] = [
  {
    file: 'lib/mocks/repo-lists/klaymakers-2022.txt',
    program: 'klaymakers-2022',
    brand: 'klaytn',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    notes: 'Hackathon submissions for Klaymakers 2022',
  },
  {
    file: 'lib/mocks/repo-lists/klaymakers-2023.txt',
    program: 'klaymakers-2023',
    brand: 'klaytn',
    periodStart: '2023-01-01',
    periodEnd: '2023-12-31',
    notes: 'Hackathon submissions for Klaymakers 2023',
  },
  {
    file: 'lib/mocks/repo-lists/kaia-2024-2025.txt',
    program: 'kaia-2024-bounties',
    brand: 'kaia',
    periodStart: '2024-09-01',
    periodEnd: '2025-12-31',
    notes: 'Kaia era bounty / community repos 2024-2025',
  },
]

function extractUrls(raw: string): string[] {
  const urlRegex = /https?:\/\/github\.com\/[^\s,"')]+/gi
  const matches = raw.match(urlRegex) || []
  return matches.map((url) => url.trim())
}

function normalizeRepoUrl(url: string): {
  owner: string
  name: string | null
  type: 'repo' | 'org'
  cleanUrl: string
} | null {
  const cleaned = url.replace(/\.git$/i, '')

  try {
    const parsed = new URL(cleaned)

    if (parsed.hostname !== 'github.com') {
      return null
    }

    const segments = parsed.pathname.split('/').filter(Boolean)

    if (segments.length === 0) {
      return null
    }

    // Handle links like /orgs/{org}/repositories
    if (segments[0] === 'orgs' && segments[2] === 'repositories') {
      return {
        owner: segments[1],
        name: null,
        type: 'org',
        cleanUrl: `https://github.com/${segments[1]}`,
      }
    }

    const owner = segments[0]
    const name = segments[1] || null

    return {
      owner,
      name,
      type: name ? 'repo' : 'org',
      cleanUrl: name ? `https://github.com/${owner}/${name}` : `https://github.com/${owner}`,
    }
  } catch {
    return null
  }
}

function mergeRecord(map: Map<string, RepoRecord>, record: RepoRecord, source: SourceConfig) {
  const key = record.name ? `${record.owner}/${record.name}` : record.owner
  if (!map.has(key)) {
    map.set(key, {
      ...record,
      sources: [],
    })
  }

  const existing = map.get(key)!
  existing.sources.push({
    program: source.program,
    brand: source.brand,
    periodStart: source.periodStart,
    periodEnd: source.periodEnd,
    notes: source.notes,
  })
}

async function main() {
  const repoMap = new Map<string, RepoRecord>()

  for (const source of SOURCES) {
    const filePath = path.join(ROOT, source.file)
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Source file not found: ${source.file}`)
      continue
    }

    const raw = fs.readFileSync(filePath, 'utf8')
    const urls = Array.from(new Set(extractUrls(raw)))

    console.log(`Processing ${urls.length} URLs from ${source.program}`)

    for (const url of urls) {
      const normalized = normalizeRepoUrl(url)
      if (!normalized) {
        console.warn(`  Skipping unrecognized URL: ${url}`)
        continue
      }

      mergeRecord(repoMap, {
        owner: normalized.owner,
        name: normalized.name,
        url: normalized.cleanUrl,
        type: normalized.type,
        sources: [],
      }, source)
    }
  }

  const catalog = Array.from(repoMap.values()).sort((a, b) => {
    const aKey = a.name ? `${a.owner}/${a.name}` : a.owner
    const bKey = b.name ? `${b.owner}/${b.name}` : b.owner
    return aKey.localeCompare(bKey)
  })

  const outputPath = path.join(ROOT, 'lib', 'mocks', 'repo-catalog.generated.json')
  fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2))

  const summary = catalog.reduce<Record<string, number>>((acc, repo) => {
    for (const source of repo.sources) {
      const key = `${source.brand}:${source.program}`
      acc[key] = (acc[key] || 0) + 1
    }
    return acc
  }, {})

  console.log(`\n✅ Generated catalog with ${catalog.length} unique entries.`)
  console.log('Breakdown by source:')
  Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`)
    })

  console.log(`\nOutput written to ${outputPath}`)
}

main().catch((err) => {
  console.error('Error generating repo catalog:', err)
  process.exit(1)
})


