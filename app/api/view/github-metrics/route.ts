import { NextRequest, NextResponse } from "next/server";

import { getGithubMetrics } from "@/lib/services/github-metrics";

// Increase timeout for complex queries (Next.js default is 10s, Vercel Pro is 60s)
// Set to 60s to match Vercel's limit, but allow some buffer
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const periodParam = req.nextUrl.searchParams.get("period") || undefined;
    const responseData = await getGithubMetrics(periodParam);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error building github metrics:", error);
    return NextResponse.json(
      { error: "Failed to build GitHub metrics" },
      { status: 500 }
    );
  }
}

