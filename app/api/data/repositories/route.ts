import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository as repositoryTable } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';
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


export async function POST(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret) {
    return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }

  const { owner, repository: repoName } = await request.json();

  // check if repository already exists
  const existingRepository = await db.select()
    .from(repositoryTable)
    .where(
      and(
        eq(repositoryTable.owner, owner),
        eq(repositoryTable.name, repoName)
      )
    )
    .limit(1);

  if (existingRepository.length > 0) {
    return NextResponse.json({ error: "Repository already exists" }, { status: 400 });
  }

  // add to db
  const newRepository = await db.insert(repositoryTable).values({
    id: createId(),
    owner,
    name: repoName,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
 
  return NextResponse.json(newRepository);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret) {
    return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }
  
  const { id } = await request.json();

  await db.delete(repositoryTable).where(eq(repositoryTable.id, id));

  return NextResponse.json({ message: "Repository deleted" }, { status: 200 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret) {
    return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }
  
  const { id, owner, repository: repoName } = await request.json();

  const updatedRepository = await db.update(repositoryTable).set({
    owner,
    name: repoName,
    updatedAt: new Date(),
  }).where(eq(repositoryTable.id, id)).returning();

  return NextResponse.json(updatedRepository);
}