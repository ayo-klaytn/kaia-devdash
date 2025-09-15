// Temporarily disable auth for Vercel testing
// import { auth } from "@/lib/auth";
// import { toNextJsHandler } from "better-auth/next-js";
 
// export const { GET, POST } = toNextJsHandler(auth.handler);

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Auth temporarily disabled" });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Auth temporarily disabled" });
}