import { NextResponse } from "next/server";

import { getBokAnalyticsSeries } from "@/lib/services/social-media";

export async function GET(): Promise<NextResponse> {
  try {
    const monthlySeries = await getBokAnalyticsSeries();
    return NextResponse.json(monthlySeries);
  } catch (error) {
    console.error("[bok-analytics] Failed to build series:", error);
    return NextResponse.json(
      {
        error: "Failed to load Build on Kaia analytics",
      },
      { status: 500 },
    );
  }
}

