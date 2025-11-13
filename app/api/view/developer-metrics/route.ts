import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'

import db from '@/lib/db'
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL } from '@/lib/cache'

const PERIOD_LABELS: Record<string, { label: string; brand: 'klaytn' | 'kaia' }> = {
  'klaytn-2022': { label: '2022', brand: 'klaytn' },
  'klaytn-2023': { label: '2023', brand: 'klaytn' },
  'klaytn-2024': { label: '2024 (Jan–Aug)', brand: 'klaytn' },
  'kaia-2024': { label: 'Kaia Era (Sep 2024+)', brand: 'kaia' },
}

const PERIOD_ORDER = Object.keys(PERIOD_LABELS)
const START_MONTH = '2022-01-01'
const END_MONTH = '2025-12-01'

const PERIOD_CASE_SQL = `
  CASE
    WHEN c.timestamp::timestamp >= '2024-09-01' THEN 'kaia-2024'
    WHEN c.timestamp::timestamp >= '2024-01-01' THEN 'klaytn-2024'
    WHEN c.timestamp::timestamp >= '2023-01-01' THEN 'klaytn-2023'
    ELSE 'klaytn-2022'
  END
`

const EMAIL_FILTER_SQL = `
  c.committer_email IS NOT NULL
  AND c.committer_email <> ''
  AND c.timestamp IS NOT NULL
  AND LOWER(c.committer_email) NOT LIKE '%noreply@github.com%'
  AND LOWER(c.committer_email) NOT LIKE '%github-actions%'
  AND LOWER(c.committer_email) NOT LIKE '%[bot]%'
  AND LOWER(c.committer_email) NOT LIKE '%bot@%'
`

const EXCLUDED_NAMES = [
  'ayo-klaytn',
  'praveen-kaia',
  'praveen-klaytn',
  'zxstim',
  'scott lee',
  'github',
  'ollie',
  'kaia-docs',
  'sotatek-quangdo',
  'sotatek-longpham2',
  'sotatek-tule2',
  'sotatek-tinnnguyen',
  'github-actions',
  'github-actions[bot]',
  'jingxuan-kaia',
  'gpt-engineer-app[bot]',
  'google-labs-jules[bot]',
  'sawyer',
  'firebase studio',
  'ollie.j',
  'yumiel yoomee1313',
  'dragon-swap',
  'hyeonlewis',
  'kjeom',
  'your name',
  'root',
  'gitbook-bot',
  'sitongliu-klaytn',
  'aidan',
  'aidenpark-kaia',
  'neoofklaytn',
  'markyim-klaytn',
  'tnasu',
  'shogo hyodo',
  'cursor agent',
  'vibe torch bot',
]

const EXCLUDED_NAMES_SQL = (() => {
  if (EXCLUDED_NAMES.length === 0) return ''
  const clauses = EXCLUDED_NAMES.map((name) => {
    const escaped = name.toLowerCase().replace(/'/g, "''")
    return `LOWER(c.committer_name) LIKE '%${escaped}%' OR LOWER(c.committer_email) LIKE '%${escaped}%'`
  })
  return clauses.length ? `AND NOT (${clauses.join(' OR ')})` : ''
})()

const EXCLUDE_REPOS_SQL = `
  AND NOT (
    (LOWER(r.owner) = 'kaiachain' AND LOWER(r.name) = 'kaia') OR
    (LOWER(r.owner) = 'carv-protocol' AND LOWER(r.name) = 'eliza-d.a.t.a')
  )
`

// Check if is_fork column exists
async function hasIsForkColumn(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repository' 
      AND column_name = 'is_fork';
    `)
    const rows = Array.isArray(result) ? result : (result.rows ?? [])
    return rows.length > 0
  } catch {
    return false
  }
}

function buildMADQuery(includeForkFilter: boolean) {
  const forkFilter = includeForkFilter ? 'AND (COALESCE(r.is_fork, false) = false)' : ''
  const periodArray = PERIOD_ORDER.map((r) => `'${r}'`).join(', ')
  const sqlString = 
    'WITH months AS (' +
    '  SELECT generate_series(' +
    '    date_trunc(\'month\', \'' + START_MONTH + '\'::date),' +
    '    date_trunc(\'month\', \'' + END_MONTH + '\'::date),' +
    '    interval \'1 month\'' +
    '  ) AS month' +
    '), ' +
    'periods AS (' +
    '  SELECT unnest(ARRAY[' + periodArray + ']::text[]) AS period' +
    '), ' +
    'commit_data AS (' +
    '  SELECT ' +
    '    date_trunc(\'month\', c.timestamp::timestamp) AS month, ' +
    '    ' + PERIOD_CASE_SQL.trim() + ' AS period, ' +
    '    lower(trim(c.committer_email)) AS committer_email ' +
    '  FROM "commit" c ' +
    '  JOIN repository r ON r.id = c.repository_id ' +
    '  WHERE ' + EMAIL_FILTER_SQL.trim() + ' ' +
        '    ' + forkFilter + ' ' +
        '    ' + EXCLUDED_NAMES_SQL + ' ' +
        '    ' + EXCLUDE_REPOS_SQL +
    ') ' +
    'SELECT ' +
    '  m.month, ' +
    '  p.period, ' +
    '  COALESCE(COUNT(DISTINCT commit_data.committer_email), 0) AS value ' +
    'FROM months m ' +
    'CROSS JOIN periods p ' +
    'LEFT JOIN commit_data ' +
    '  ON commit_data.month = m.month ' +
    '  AND commit_data.period = p.period ' +
    'GROUP BY m.month, p.period ' +
    'ORDER BY m.month, p.period;'
  return sql.raw(sqlString)
}

function buildNewDevsQuery(includeForkFilter: boolean) {
  const forkFilter = includeForkFilter ? 'AND (COALESCE(r.is_fork, false) = false)' : ''
  const periodArray = PERIOD_ORDER.map((r) => `'${r}'`).join(', ')
  const sqlString = 
    'WITH months AS (' +
    '  SELECT generate_series(' +
    '    date_trunc(\'month\', \'' + START_MONTH + '\'::date),' +
    '    date_trunc(\'month\', \'' + END_MONTH + '\'::date),' +
    '    interval \'1 month\'' +
    '  ) AS month' +
    '), ' +
    'periods AS (' +
    '  SELECT unnest(ARRAY[' + periodArray + ']::text[]) AS period' +
    '), ' +
    'commit_data AS (' +
    '  SELECT ' +
    '    date_trunc(\'month\', c.timestamp::timestamp) AS month, ' +
    '    ' + PERIOD_CASE_SQL.trim() + ' AS period, ' +
    '    lower(trim(c.committer_email)) AS committer_email ' +
    '  FROM "commit" c ' +
    '  JOIN repository r ON r.id = c.repository_id ' +
    '  WHERE ' + EMAIL_FILTER_SQL.trim() + ' ' +
        '    ' + forkFilter + ' ' +
        '    ' + EXCLUDED_NAMES_SQL + ' ' +
        '    ' + EXCLUDE_REPOS_SQL +
    '), ' +
    'first_commits AS (' +
    '  SELECT ' +
    '    period, ' +
    '    committer_email, ' +
    '    MIN(month) AS month ' +
    '  FROM commit_data ' +
    '  GROUP BY period, committer_email' +
    ') ' +
    'SELECT ' +
    '  m.month, ' +
    '  p.period, ' +
    '  COALESCE(COUNT(fc.committer_email), 0) AS value ' +
    'FROM months m ' +
    'CROSS JOIN periods p ' +
    'LEFT JOIN first_commits fc ' +
    '  ON fc.month = m.month ' +
    '  AND fc.period = p.period ' +
    'GROUP BY m.month, p.period ' +
    'ORDER BY m.month, p.period;'
  return sql.raw(sqlString)
}

export async function GET(req: NextRequest) {
  try {
    const metric = req.nextUrl.searchParams.get('metric') === 'new' ? 'new' : 'mad'
    
    // Check cache first
    const cacheKey = generateCacheKey("developer-metrics", { metric });
    const cached = await getCachedData<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    const hasForkColumn = await hasIsForkColumn()
    const query = metric === 'new' 
      ? buildNewDevsQuery(hasForkColumn)
      : buildMADQuery(hasForkColumn)

    const result = await db.execute(query)
    const rows = (Array.isArray(result) ? result : result.rows ?? []) as Array<{
      month: Date
      period: string
      value: number
    }>

    const monthsMap = new Map<string, Record<string, number>>()
    for (const row of rows) {
      const monthKey = new Date(row.month).toISOString().slice(0, 10)
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {})
      }
      monthsMap.get(monthKey)![row.period] = Number(row.value ?? 0)
    }

    const items = Array.from(monthsMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, values]) => ({
        month,
        values: PERIOD_ORDER.reduce<Record<string, number>>((acc, period) => {
          acc[period] = values[period] ?? 0
          return acc
        }, {}),
      }))

    const periods = PERIOD_ORDER.map((period) => ({
      id: period,
      ...PERIOD_LABELS[period],
    }))

    // Calculate summary totals and YoY
    const periodTotals: Record<string, number> = {}
    for (const row of rows) {
      periodTotals[row.period] = (periodTotals[row.period] ?? 0) + row.value
    }

    const summary = PERIOD_ORDER.map((periodId, index) => {
      const total = periodTotals[periodId] ?? 0
      let yoyPercent: number | null = null
      if (index > 0) {
        const prevPeriodId = PERIOD_ORDER[index - 1]
        const prevTotal = periodTotals[prevPeriodId] ?? 0
        if (prevTotal > 0) {
          yoyPercent = ((total - prevTotal) / prevTotal) * 100
        } else if (total > 0) {
          yoyPercent = 100 // Infinite growth from zero
        }
      }
      return {
        id: periodId,
        label: PERIOD_LABELS[periodId].label,
        total,
        yoyPercent: yoyPercent !== null ? parseFloat(yoyPercent.toFixed(1)) : null,
      }
    })

    const responseData = {
      metric,
      periods,
      items,
      summary,
    };

    // Cache the response
    await setCachedData(cacheKey, responseData, CACHE_TTL.DEVELOPER_METRICS);

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error generating developer metrics:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate developer metrics',
      },
      { status: 500 }
    )
  }
}


