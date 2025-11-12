import { NextRequest, NextResponse } from "next/server";
import { aggregateJobLog } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import db from "@/lib/db";
import { cleanupExpiredCache, invalidateCache } from "@/lib/cache";

/**
 * Background job to refresh API cache
 * Can be called via cron or scheduled task
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.API_SECRET || process.env.CRON_SECRET;
    
    // Optional: require auth token for security
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = `refresh-cache-${Date.now()}`;
    const startedAt = new Date();

    try {
      // Clean up expired cache entries
      const cleanedCount = await cleanupExpiredCache();
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);

      // Invalidate all caches (they'll be regenerated on next request)
      // Or you can pre-warm specific caches here
      const invalidatedCount = await invalidateCache("%");
      console.log(`Invalidated ${invalidatedCount} cache entries`);

      const finishedAt = new Date();
      
      // Log job completion
      await db.insert(aggregateJobLog).values({
        id: jobId,
        jobName: "refresh-cache",
        status: "success",
        message: `Cleaned ${cleanedCount} expired entries, invalidated ${invalidatedCount} entries`,
        startedAt,
        finishedAt,
      });

      return NextResponse.json({
        success: true,
        cleaned: cleanedCount,
        invalidated: invalidatedCount,
      });
    } catch (error) {
      const finishedAt = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await db.insert(aggregateJobLog).values({
        id: jobId,
        jobName: "refresh-cache",
        status: "error",
        message: errorMessage,
        startedAt,
        finishedAt,
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in refresh-cache job:", error);
    return NextResponse.json(
      { error: "Failed to refresh cache" },
      { status: 500 }
    );
  }
}

// Allow GET for easy testing
export async function GET() {
  return POST(new NextRequest("http://localhost", { method: "POST" }));
}

