import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository as repositoryTable } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';

export async function POST(request: NextRequest): Promise<NextResponse> {

  const headersList = await headers();
  const apiKey = headersList.get('apiKey');

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repository: repoName } = await request.json();

  // add to db
  const newRepository = await db.insert(repositoryTable).values({
    id: createId(),
    owner,
    name: repoName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
 
  return NextResponse.json({ repository: newRepository });
}