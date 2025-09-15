import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    // Simple database connection test
    const result = await db.execute("SELECT 1 as test");
    return NextResponse.json({ 
      status: "healthy", 
      database: "connected",
      test: result 
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json({ 
      status: "unhealthy", 
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
