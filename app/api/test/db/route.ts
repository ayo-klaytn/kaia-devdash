import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    // Test database connection with a simple query
    const result = await db.execute("SELECT 1 as test");
    return NextResponse.json({ 
      message: "Database test successful",
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json({ 
      message: "Database test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
