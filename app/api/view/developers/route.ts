import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

import { buildDevelopersResponseJson, getDevelopersData } from "@/lib/services/developers";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("Starting developers API...");

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "200", 10);

    const data = await getDevelopersData({ page, limit });
    return buildDevelopersResponseJson(data);
  } catch (error) {
    console.error("Error in developers API:", error);
    return NextResponse.json(
      {
        error: "Database error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
