import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/lib/db";
import { xPosts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/data/x-posts
 * Fetch all X/Twitter posts from database
 * Query params: account, type, limit, offset
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const account = searchParams.get("account");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query with conditional where clause
    const baseQuery = db.select().from(xPosts);
    const query = account 
      ? baseQuery.where(eq(xPosts.account, account))
      : baseQuery;
    
    const results = await query
      .orderBy(desc(xPosts.date))
      .limit(limit)
      .offset(offset);

    // Filter by type if specified (in-memory filter)
    const filtered = type
      ? results.filter((post) => post.type === type)
      : results;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching X posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch X posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data/x-posts
 * Upload X/Twitter posts from CSV data
 * Body: Array of post objects
 * Requires API_SECRET in headers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Allow internal dashboard requests without authentication
  // For external API calls, API_SECRET can be provided in headers for validation
  const headersList = await headers();
  const apiSecret = headersList.get("apiSecret");

  // If API_SECRET is provided, validate it
  // If not provided, allow the request (assumed to be from internal dashboard)
  if (apiSecret && process.env.API_SECRET) {
    if (apiSecret !== process.env.API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  
  // If no API_SECRET provided, allow the request (internal dashboard use)

  try {
    const posts = await request.json();

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { error: "Expected an array of posts" },
        { status: 400 }
      );
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const post of posts) {
      try {
        // Validate required fields
        if (!post.url || !post.title || !post.date) {
          errors.push(`Missing required fields for post: ${post.url || "unknown"}`);
          skipped++;
          continue;
        }

        // Extract status ID from URL
        // URL format: https://x.com/BuildonKaia/status/1993953232146846196
        const statusIdMatch = post.url.match(/\/status\/(\d+)/);
        if (!statusIdMatch) {
          errors.push(`Invalid URL format: ${post.url}`);
          skipped++;
          continue;
        }

        const statusId = statusIdMatch[1];

        // Parse views number for sorting
        let viewsNumber = 0;
        if (post.views) {
          const viewsStr = String(post.views).toLowerCase().replace(/\s/g, "");
          if (viewsStr.includes("k")) {
            viewsNumber = parseFloat(viewsStr.replace("k", "")) * 1000;
          } else if (viewsStr.includes("m")) {
            viewsNumber = parseFloat(viewsStr.replace("m", "")) * 1000000;
          } else {
            viewsNumber = parseFloat(viewsStr) || 0;
          }
        }

        // Check if post already exists
        const existing = await db
          .select()
          .from(xPosts)
          .where(eq(xPosts.id, statusId))
          .limit(1);

        const postData = {
          id: statusId,
          title: post.title,
          url: post.url,
          views: post.views || null,
          viewsNumber: Math.round(viewsNumber),
          likes: parseInt(post.likes) || 0,
          retweets: parseInt(post.retweets) || 0,
          comments: parseInt(post.comments) || 0,
          date: post.date,
          type: post.type || "Announcement",
          account: post.account || "BuildonKaia",
          createdAt: existing.length > 0 ? existing[0].createdAt : new Date(),
          updatedAt: new Date(),
        };

        if (existing.length > 0) {
          // Update existing post
          await db
            .update(xPosts)
            .set({
              title: postData.title,
              views: postData.views,
              viewsNumber: postData.viewsNumber,
              likes: postData.likes,
              retweets: postData.retweets,
              comments: postData.comments,
              date: postData.date,
              type: postData.type,
              updatedAt: postData.updatedAt,
            })
            .where(eq(xPosts.id, statusId));
          updated++;
        } else {
          // Insert new post
          await db.insert(xPosts).values(postData);
          inserted++;
        }
      } catch (error) {
        console.error(`Error processing post ${post.url}:`, error);
        errors.push(`Error processing ${post.url}: ${error instanceof Error ? error.message : "Unknown error"}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error uploading X posts:", error);
    return NextResponse.json(
      { error: "Failed to upload X posts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

