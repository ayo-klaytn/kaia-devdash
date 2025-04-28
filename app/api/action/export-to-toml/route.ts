import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository as repositoryTable } from "@/lib/db/schema";
import { headers } from 'next/headers';


export async function GET(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret) {
    return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }

  // return paginated list of repositories
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const repositories = await db.select()
    .from(repositoryTable)
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(repositories);
}