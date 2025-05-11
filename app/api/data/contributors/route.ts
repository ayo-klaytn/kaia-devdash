import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { contributor } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, asc } from "drizzle-orm";


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
  const owner = searchParams.get('owner') || '';
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const contributors = await db.select()
    .from(contributor)
    .where(
      owner ? eq(contributor.username, owner) : undefined
    )
    .orderBy(asc(contributor.username))
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(contributors);
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

  const { repositoryId, username, email, htmlUrl, profilePictureUrl, contributorId, contributorNodeId, accountType, rawResponse } = await request.json();

  // check if contributor already exists
  const existingContributor = await db.select()
    .from(contributor)
    .where(
      and(
        eq(contributor.repositoryId, repositoryId),
        eq(contributor.username, username)
      )
    )
    .limit(1);

  if (existingContributor.length > 0) {
    return NextResponse.json({ error: "Contributor already recorded for that repository" }, { status: 400 });
  }

  // add to db
  const newContributor = await db.insert(contributor).values({
    id: createId(),
    repositoryId,
    username,
    email,
    htmlUrl,
    profilePictureUrl,
    contributorId,
    contributorNodeId,
    accountType,
    rawResponse,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
 
  return NextResponse.json(newContributor);
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

  await db.delete(contributor).where(eq(contributor.id, id));

  return NextResponse.json({ message: "Contributor deleted" }, { status: 200 });
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
  
  const { id, username, email, htmlUrl, profilePictureUrl, contributorId, contributorNodeId, accountType, rawResponse } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Contributor ID is required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: { username?: string; email?: string; htmlUrl?: string; profilePictureUrl?: string; contributorId?: string; contributorNodeId?: string; accountType?: string; rawResponse?: any; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (htmlUrl !== undefined) updateData.htmlUrl = htmlUrl;
  if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;
  if (contributorId !== undefined) updateData.contributorId = contributorId;
  if (contributorNodeId !== undefined) updateData.contributorNodeId = contributorNodeId;
  if (accountType !== undefined) updateData.accountType = accountType;
  if (rawResponse !== undefined) updateData.rawResponse = rawResponse;

  const updatedContributor = await db.update(contributor)
    .set(updateData)
    .where(eq(contributor.id, id))
    .returning();

  return NextResponse.json(updatedContributor);
}