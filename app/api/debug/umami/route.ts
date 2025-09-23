import { NextResponse } from "next/server";
import { loginUmami } from "@/lib/umami";

export const runtime = 'nodejs';

export async function GET() {
  const envCheck = {
    UMAMI_BASE_URL: process.env.UMAMI_BASE_URL || 'NOT_SET',
    UMAMI_USERNAME: process.env.UMAMI_USERNAME || 'NOT_SET',
    UMAMI_PASSWORD: process.env.UMAMI_PASSWORD ? `SET (length: ${process.env.UMAMI_PASSWORD.length})` : 'NOT_SET',
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID || 'NOT_SET',
  };

  try {
    const token = await loginUmami();
    return NextResponse.json({ ok: true, tokenLength: token.length, env: envCheck });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e), env: envCheck }, { status: 500 });
  }
}
