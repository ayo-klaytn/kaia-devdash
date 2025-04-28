import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository as repositoryTable } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { eq, and } from "drizzle-orm";


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
  const id = searchParams.get('id');
  const owner = searchParams.get('owner');
  const repositoryName = searchParams.get('repository');

  if (!id && !owner && !repositoryName) {
    return NextResponse.json({ error: "Repository ID or owner or repository name is required" }, { status: 400 });
  }

  let repository;

  if (id) {
    repository = await db.select()
      .from(repositoryTable)
      .where(eq(repositoryTable.id, id))
      .limit(1);
  }

  if (owner && repositoryName) {
    repository = await db.select()
      .from(repositoryTable)
      .where(
        and(
          eq(repositoryTable.owner, owner),
          eq(repositoryTable.name, repositoryName)
        )
      )
      .limit(1);
  }

  if (!repository || repository.length === 0) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  return NextResponse.json(repository[0]);
}