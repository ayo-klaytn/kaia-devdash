import { NextRequest, NextResponse } from 'next/server'

type NpmRangeResponse = {
  package?: string
  start?: string
  end?: string
  downloads: { day: string; downloads: number }[]
}

function toUtcDateOnly(d: Date): string {
  const y = d.getUTCFullYear()
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${d.getUTCDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeekUTC(date: Date, weekStart: 'monday' | 'sunday' = 'monday'): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() // 0=Sun..6=Sat
  let diff: number
  if (weekStart === 'monday') {
    // Monday start: shift so that Monday is day 0
    const normalized = day === 0 ? 6 : day - 1
    diff = normalized
  } else {
    // Sunday start
    diff = day
  }
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

async function fetchNpmRange(pkg: string, start: string, end: string): Promise<NpmRangeResponse> {
  const encoded = encodeURIComponent(pkg)
  const url = `https://api.npmjs.org/downloads/range/${start}:${end}/${encoded}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    throw new Error(`Failed to fetch npm downloads for ${pkg}: ${res.status}`)
  }
  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const packagesParam = searchParams.get('packages')?.trim()
    const startParam = searchParams.get('start')?.trim()
    const endParam = searchParams.get('end')?.trim()
    const granularity = (searchParams.get('granularity')?.trim() || 'weekly').toLowerCase()
    const weekStart = ((searchParams.get('weekStart')?.trim() || 'monday').toLowerCase() as 'monday' | 'sunday')

    if (!packagesParam) {
      return NextResponse.json({ error: 'packages query param is required (comma-separated)' }, { status: 400 })
    }

    if (!startParam || !endParam) {
      return NextResponse.json({ error: 'start and end query params are required (YYYY-MM-DD)' }, { status: 400 })
    }

    if (granularity !== 'weekly' && granularity !== 'daily') {
      return NextResponse.json({ error: 'granularity must be weekly or daily' }, { status: 400 })
    }

    const pkgs = packagesParam.split(',').map(s => s.trim()).filter(Boolean)
    if (pkgs.length === 0) {
      return NextResponse.json({ error: 'no valid packages provided' }, { status: 400 })
    }

    const results = await Promise.all(
      pkgs.map(async (pkg) => {
        const data = await fetchNpmRange(pkg, startParam, endParam)
        if (granularity === 'daily') {
          return {
            package: pkg,
            series: data.downloads.map(d => ({ date: d.day, downloads: d.downloads }))
          }
        }

        // weekly aggregation (UTC, configurable week start)
        const weekMap = new Map<string, number>()
        for (const point of data.downloads) {
          const d = new Date(point.day + 'T00:00:00Z')
          const weekStartDate = startOfWeekUTC(d, weekStart)
          const key = toUtcDateOnly(weekStartDate)
          weekMap.set(key, (weekMap.get(key) || 0) + (point.downloads || 0))
        }
        const series = Array.from(weekMap.entries())
          .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
          .map(([weekStartKey, downloads]) => ({ weekStart: weekStartKey, downloads }))

        return { package: pkg, series }
      })
    )

    return NextResponse.json({
      packages: pkgs,
      granularity,
      start: startParam,
      end: endParam,
      weekStart,
      data: results
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


