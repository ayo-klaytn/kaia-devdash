import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repositoryStats } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';
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
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const repositoryStatsList = await db.select()
    .from(repositoryStats)
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(repositoryStatsList);
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
  
  const { repositoryId, stars, forks, watchers } = await request.json();

  const existingRepositoryStats = await db.select().from(repositoryStats).where(eq(repositoryStats.repositoryId, repositoryId));

  if (existingRepositoryStats.length > 0) {
    return NextResponse.json({ error: "Repository stats already exists" }, { status: 400 });
  }

  const newRepositoryStats = await db.insert(repositoryStats).values({
    id: createId(),
    repositoryId: repositoryId,
    stars,
    forks,
    watchers,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return NextResponse.json(newRepositoryStats);
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

  const { repositoryId, stars, forks, watchers } = await request.json();

  const updatedRepositoryStats = await db.update(repositoryStats)
    .set({
      stars,
      forks,
      watchers,
      updatedAt: new Date(),
    })
    .where(eq(repositoryStats.repositoryId, repositoryId))
    .returning();

  return NextResponse.json(updatedRepositoryStats);
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

  const { repositoryId } = await request.json();

  const deletedRepositoryStats = await db.delete(repositoryStats).where(eq(repositoryStats.repositoryId, repositoryId));

  if (deletedRepositoryStats.length === 0) {
    return NextResponse.json({ error: "Repository stats not found" }, { status: 404 });
  }

  return NextResponse.json(deletedRepositoryStats);
}