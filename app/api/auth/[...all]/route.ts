// Temporarily disable auth for Vercel testing
// import { auth } from "@/lib/auth";
// import { toNextJsHandler } from "better-auth/next-js";
 
// export const { GET, POST } = toNextJsHandler(auth.handler);

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Auth temporarily disabled" });
}

export async function POST() {
  return NextResponse.json({ message: "Auth temporarily disabled" });
}