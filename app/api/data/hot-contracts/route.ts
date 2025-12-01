import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function fetchFromDune(): Promise<number> {
  const apiKey = process.env.DUNE_API_KEY;
  const queryId = process.env.DUNE_HOT_CONTRACTS_QUERY_ID || "4220772";
  if (!apiKey) return 0;

  const res = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results`, {
    headers: {
      "X-Dune-API-Key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return 0;

  const data = await res.json();
  const rows = data?.result?.rows || data?.rows || [];
  if (!Array.isArray(rows) || rows.length === 0) return 0;

  // For this query we expect one row per "hot" contract, so use the row count.
  return rows.length;
}

export async function GET() {
  try {
    const value = await fetchFromDune();
    const res = NextResponse.json({ hotContracts: value });
    res.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
    return res;
  } catch {
    return NextResponse.json({ hotContracts: 0 }, { status: 200 });
  }
}


