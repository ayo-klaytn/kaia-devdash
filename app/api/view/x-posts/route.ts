import { NextResponse } from "next/server";
import db from "@/lib/db";
import { xPosts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/view/x-posts
 * Fetch X/Twitter posts for display on dashboard
 * Returns posts sorted by date (newest first)
 * Query params: account, type, limit
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const account = searchParams.get("account") || "BuildonKaia";
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "1000");

    const query = db
      .select()
      .from(xPosts)
      .where(eq(xPosts.account, account))
      .orderBy(desc(xPosts.date))
      .limit(limit);

    const results = await query;

    // Filter by type if specified
    const filtered = type
      ? results.filter((post) => post.type === type)
      : results;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching X posts for view:", error);
    return NextResponse.json(
      { error: "Failed to fetch X posts" },
      { status: 500 }
    );
  }
}

