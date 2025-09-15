import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs'
import db from "@/lib/db";
import { developer } from "@/lib/db/schema";
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
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const developers = await db.select()
    .from(developer)
    .orderBy(asc(developer.name))
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(developers);
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

  try {
    const { name, github, address, communityRank, xHandle, bootcampGraduated, bootcampContributor, nftBadges, ownerOf, contributorIn, commitsIn } = await request.json();

    console.log('Received developer data:', { name, github, address, communityRank, xHandle, bootcampGraduated, bootcampContributor });

    // Convert ISO string dates back to Date objects
    const parsedBootcampGraduated = bootcampGraduated ? new Date(bootcampGraduated) : null;
    const parsedBootcampContributor = bootcampContributor ? new Date(bootcampContributor) : null;

    // check if developer already exists
    const existingDeveloper = await db.select()
      .from(developer)
      .where(
        and(
          eq(developer.name, name),
          eq(developer.github, github)
        )
      )
      .limit(1);

    if (existingDeveloper.length > 0) {
      return NextResponse.json({ error: "Developer already exists" }, { status: 400 });
    }

    // add to db
    const newDeveloper = await db.insert(developer).values({
      id: createId(),
      name,
      github,
      address,
      communityRank,
      xHandle,
      nftBadges,
      ownerOf,
      contributorIn,
      commitsIn,
      bootcampGraduated: parsedBootcampGraduated,
      bootcampContributor: parsedBootcampContributor,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
   
    console.log('Developer created successfully:', newDeveloper[0]?.name);
    return NextResponse.json(newDeveloper);
  } catch (error) {
    console.error('Error creating developer:', error);
    return NextResponse.json({ 
      error: "Database error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
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

  await db.delete(developer).where(eq(developer.id, id));

  return NextResponse.json({ message: "Developer deleted" }, { status: 200 });
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
  
  const { id, name, github, address, communityRank, xHandle, bootcampGraduated, bootcampContributor, nftBadges, ownerOf, contributorIn, commitsIn } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Developer ID is required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: { name?: string; github?: string; address?: string; communityRank?: number; xHandle?: string; bootcampGraduated?: Date; bootcampContributor?: Date; nftBadges?: any; ownerOf?: any; contributorIn?: any; commitsIn?: any; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (name !== undefined) updateData.name = name;
  if (github !== undefined) updateData.github = github;
  if (address !== undefined) updateData.address = address;
  if (communityRank !== undefined) updateData.communityRank = communityRank;
  if (xHandle !== undefined) updateData.xHandle = xHandle;
  if (bootcampGraduated !== undefined) updateData.bootcampGraduated = bootcampGraduated;
  if (bootcampContributor !== undefined) updateData.bootcampContributor = bootcampContributor;
  if (nftBadges !== undefined) updateData.nftBadges = nftBadges;
  if (ownerOf !== undefined) updateData.ownerOf = ownerOf;
  if (contributorIn !== undefined) updateData.contributorIn = contributorIn;
  if (commitsIn !== undefined) updateData.commitsIn = commitsIn;

  const updatedDeveloper = await db.update(developer)
    .set(updateData)
    .where(eq(developer.id, id))
    .returning();

  return NextResponse.json(updatedDeveloper);
}