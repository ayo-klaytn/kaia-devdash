import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository, socialMedia } from "@/lib/db/schema";
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
  const name = searchParams.get('name') || '';
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const socialMediaData = await db.select()
    .from(socialMedia)
    .where(
      and(
        eq(socialMedia.name, name)
      )
    )
    .orderBy(asc(socialMedia.date))
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(socialMediaData);
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

  const { name, date, impressions, likes, engagements, bookmarks, shares, newFollows, unfollows, replies, reposts, profileVisits, createPost, videoViews, mediaViews } = await request.json();

  // check if repository already exists
  const existingRepository = await db.select()
    .from(socialMedia)
    .where(
      and(
        eq(socialMedia.date, date)
      )
    )
    .limit(1);

  if (existingRepository.length > 0) {
    return NextResponse.json({ error: "Repository already exists" }, { status: 400 });
  }

  // add to db
  const newRepository = await db.insert(socialMedia).values({
    id: createId(),
    name,
    date,
    impressions,
    likes,
    engagements,
    bookmarks,
    shares,
    newFollows,
    unfollows,
    replies,
    reposts,
    profileVisits,
    createPost,
    videoViews,
    mediaViews,
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

  await db.delete(repository).where(eq(repository.id, id));

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
  
  const { id, owner, repository: repoName, url, remark, status } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
  }

  const updateData: { owner?: string; name?: string; url?: string; remark?: string; status?: string; updatedAt: Date } = {
    status: status || "inactive",
    url: url,
    remark: remark || "external",
    updatedAt: new Date(),
  };

  if (owner !== undefined) updateData.owner = owner;
  if (repoName !== undefined) updateData.name = repoName;

  const updatedRepository = await db.update(repository)
    .set(updateData)
    .where(eq(repository.id, id))
    .returning();

  return NextResponse.json(updatedRepository);
}