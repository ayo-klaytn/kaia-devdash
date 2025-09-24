import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    UMAMI_BASE_URL: process.env.UMAMI_BASE_URL || 'NOT_SET',
    UMAMI_USERNAME: process.env.UMAMI_USERNAME || 'NOT_SET',
    UMAMI_PASSWORD: process.env.UMAMI_PASSWORD ? 'SET' : 'NOT_SET',
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID || 'NOT_SET',
  });
}
