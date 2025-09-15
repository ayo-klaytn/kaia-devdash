import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs'
import db from "@/lib/db";
import { commit } from "@/lib/db/schema";
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
  const commits = await db.select()
    .from(commit)
    .orderBy(asc(commit.committerName))
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(commits);
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

  const { repositoryId, committerName, committerEmail, timestamp, url, rawResponse, sha } = await request.json();

  // check if repository already exists
  const existingCommit = await db.select()
    .from(commit)
    .where(eq(commit.sha, sha))
    .limit(1);

  if (existingCommit.length > 0) {
    return NextResponse.json({ error: "Commit already exists" }, { status: 400 });
  }

  // add to db
  const newCommit = await db.insert(commit).values({
    id: createId(),
    repositoryId,
    committerName,
    committerEmail,
    timestamp,
    url,
    sha,
    createdAt: new Date(),
    updatedAt: new Date(),
    rawResponse,
  }).returning();
 
  return NextResponse.json(newCommit);
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

  await db.delete(commit).where(eq(commit.id, id));

  return NextResponse.json({ message: "Commit deleted" }, { status: 200 });
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
  
  const { id, committerName, committerEmail, timestamp, url, rawResponse, sha } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Commit ID is required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: { committerName?: string; committerEmail?: string; timestamp?: string; url?: string; rawResponse?: any; updatedAt: Date, sha?: string } = {
    committerName: committerName,
    committerEmail: committerEmail,
    timestamp: timestamp,
    url: url,
    sha: sha,
    rawResponse: rawResponse,
    updatedAt: new Date(),
  };

  if (committerName !== undefined) updateData.committerName = committerName;
  if (committerEmail !== undefined) updateData.committerEmail = committerEmail;
  if (timestamp !== undefined) updateData.timestamp = timestamp;
  if (url !== undefined) updateData.url = url;
  if (rawResponse !== undefined) updateData.rawResponse = rawResponse;

  const updatedCommit = await db.update(commit)
    .set(updateData)
    .where(eq(commit.id, id))
    .returning();

  return NextResponse.json(updatedCommit);
}