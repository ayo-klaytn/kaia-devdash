import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repositoryStats } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { eq } from "drizzle-orm";


export async function GET(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret) {
    return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const repositoryId = searchParams.get('repositoryId');

  if (!repositoryId) {
    return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
  }

  let repositoryStat;

  if (repositoryId) {
    repositoryStat = await db.select()
      .from(repositoryStats)
      .where(eq(repositoryStats.repositoryId, repositoryId));
  }

  return NextResponse.json(repositoryStat);
}