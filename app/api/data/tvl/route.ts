import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function fetchFromDune(): Promise<number> {
  const apiKey = process.env.DUNE_API_KEY;
  const queryId = process.env.DUNE_TVL_QUERY_ID || "4222136";
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

  const first = rows[0] as Record<string, unknown>;
  const candidates = ["tvl", "usd", "value", "amount"];
  for (const key of candidates) {
    const v = first[key];
    if (typeof v === "number") return v;
    if (typeof v === "string" && !Number.isNaN(Number(v))) return Number(v);
  }
  const numeric = Object.values(first).find((v) => typeof v === "number");
  return typeof numeric === "number" ? numeric : 0;
}

export async function GET() {
  try {
    const value = await fetchFromDune();
    const res = NextResponse.json({ tvlUsd: value });
    res.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
    return res;
  } catch {
    return NextResponse.json({ tvlUsd: 0 }, { status: 200 });
  }
}


