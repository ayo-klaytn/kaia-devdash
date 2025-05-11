import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { developer } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";


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
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: "No name provided" }, { status: 400 });
  }

  const developerData = await db.select().from(developer).where(eq(developer.name, name));

  return NextResponse.json(developerData[0]);
}

