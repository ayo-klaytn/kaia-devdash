import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { githubOrganization } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';
import { eq, asc } from "drizzle-orm";


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
  const githubOrganizations = await db.select()
    .from(githubOrganization)
    .orderBy(asc(githubOrganization.username))
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(githubOrganizations);
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

  const { username } = await request.json();

  // check if repository already exists
  const existingGithubOrganization = await db.select()
    .from(githubOrganization)
    .where(eq(githubOrganization.username, username))
    .limit(1);

  if (existingGithubOrganization.length > 0) {
    return NextResponse.json({ error: "Repository already exists" }, { status: 400 });
  }

  // add to db
  const newGithubOrganization = await db.insert(githubOrganization).values({
    id: createId(),
    username: username,
    url: `https://github.com/${username}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
 
  return NextResponse.json(newGithubOrganization);
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

  await db.delete(githubOrganization).where(eq(githubOrganization.id, id));

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
  
  const { id, url, username } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
  }

  const updateData: { username?: string; url?: string; updatedAt: Date } = {
    username: username,
    url: url,
    updatedAt: new Date(),
  };

  const updatedGithubOrganization = await db.update(githubOrganization)
    .set(updateData)
    .where(eq(githubOrganization.id, id))
    .returning();

  return NextResponse.json(updatedGithubOrganization);
}