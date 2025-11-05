import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

async function fetchFromDune(): Promise<number> {
  const apiKey = process.env.DUNE_API_KEY;
  const queryId = process.env.DUNE_ACTIVE_CONTRACTS_QUERY_ID || '4216780';
  if (!apiKey) return 0;

  // Execute or get latest result for the query
  // Prefer using the latest results endpoint to avoid running a fresh job each request
  const res = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results`, {
    headers: {
      'X-Dune-API-Key': apiKey,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) return 0;
  const data = await res.json();
  // Dune formats rows under data.result.rows; try common shapes
  const rows = data?.result?.rows || data?.rows || [];
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  // Try common field names
  const first = rows[0] as Record<string, unknown>;
  const candidates = [
    'active_contracts', 'activeContracts', 'contracts', 'count', 'value'
  ];
  for (const key of candidates) {
    const v = first[key];
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && !Number.isNaN(Number(v))) return Number(v);
  }
  // Fallback: try to find first numeric in the row
  const numeric = Object.values(first).find(v => typeof v === 'number');
  return typeof numeric === 'number' ? numeric : 0;
}

export async function GET() {
  try {
    const value = await fetchFromDune();
    const res = NextResponse.json({ activeContracts: value });
    res.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res;
  } catch {
    return NextResponse.json({ activeContracts: 0 }, { status: 200 });
  }
}


