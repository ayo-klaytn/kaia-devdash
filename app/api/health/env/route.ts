import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ 
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasApiSecret: !!process.env.API_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasGithubToken: !!process.env.GITHUB_TOKEN,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    // Don't expose actual values for security
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
  });
}
