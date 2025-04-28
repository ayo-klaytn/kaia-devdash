import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { subEcosystem } from "@/lib/db/schema";
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
  const subEcosystems = await db.select()
    .from(subEcosystem)
    .orderBy(asc(subEcosystem.name))
    .limit(parseInt(limit))
    .offset(offset);

  return NextResponse.json(subEcosystems);
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

  const { name } = await request.json();

  // check if repository already exists
  const existingSubEcosystem = await db.select()
    .from(subEcosystem)
    .where(eq(subEcosystem.name, name))
    .limit(1);

  if (existingSubEcosystem.length > 0) {
    return NextResponse.json({ error: "Repository already exists" }, { status: 400 });
  }

  // add to db
  const newSubEcosystem = await db.insert(subEcosystem).values({
    id: createId(),
    name: name,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
 
  return NextResponse.json(newSubEcosystem);
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

  await db.delete(subEcosystem).where(eq(subEcosystem.id, id));

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
  
  const { id, name } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
  }

  const updateData: { name?: string; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (name !== undefined) updateData.name = name;

  const updatedSubEcosystem = await db.update(subEcosystem)
    .set(updateData)
    .where(eq(subEcosystem.id, id))
    .returning();

  return NextResponse.json(updatedSubEcosystem);
}