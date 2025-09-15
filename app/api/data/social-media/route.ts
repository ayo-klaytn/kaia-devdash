import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { socialMedia } from "@/lib/db/schema";
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

  // return paginated list of social media data
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

  // check if social media entry already exists for this name and date
  const existingEntry = await db.select()
    .from(socialMedia)
    .where(
      and(
        eq(socialMedia.name, name),
        eq(socialMedia.date, date)
      )
    )
    .limit(1);

  if (existingEntry.length > 0) {
    return NextResponse.json({ error: "Social media entry already exists for this date" }, { status: 400 });
  }

  // add to db
  const newEntry = await db.insert(socialMedia).values({
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
 
  return NextResponse.json(newEntry);
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

  await db.delete(socialMedia).where(eq(socialMedia.id, id));

  return NextResponse.json({ message: "Social media entry deleted" }, { status: 200 });
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
  
  const { id, name, date, impressions, likes, engagements, bookmarks, shares, newFollows, unfollows, replies, reposts, profileVisits, createPost, videoViews, mediaViews } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Social media entry ID is required" }, { status: 400 });
  }

  const updateData: { name?: string; date?: string; impressions?: number; likes?: number; engagements?: number; bookmarks?: number; shares?: number; newFollows?: number; unfollows?: number; replies?: number; reposts?: number; profileVisits?: number; createPost?: number; videoViews?: number; mediaViews?: number; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (name !== undefined) updateData.name = name;
  if (date !== undefined) updateData.date = date;
  if (impressions !== undefined) updateData.impressions = impressions;
  if (likes !== undefined) updateData.likes = likes;
  if (engagements !== undefined) updateData.engagements = engagements;
  if (bookmarks !== undefined) updateData.bookmarks = bookmarks;
  if (shares !== undefined) updateData.shares = shares;
  if (newFollows !== undefined) updateData.newFollows = newFollows;
  if (unfollows !== undefined) updateData.unfollows = unfollows;
  if (replies !== undefined) updateData.replies = replies;
  if (reposts !== undefined) updateData.reposts = reposts;
  if (profileVisits !== undefined) updateData.profileVisits = profileVisits;
  if (createPost !== undefined) updateData.createPost = createPost;
  if (videoViews !== undefined) updateData.videoViews = videoViews;
  if (mediaViews !== undefined) updateData.mediaViews = mediaViews;

  const updatedEntry = await db.update(socialMedia)
    .set(updateData)
    .where(eq(socialMedia.id, id))
    .returning();

  return NextResponse.json(updatedEntry);
}