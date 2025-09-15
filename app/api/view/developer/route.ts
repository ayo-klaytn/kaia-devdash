import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { developer, githubOrganization } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


export async function GET(request: NextRequest): Promise<NextResponse> {
  // Temporarily disable auth for Vercel testing
  // TODO: Re-enable authentication once we debug the header mismatch
  // const headersList = await headers();
  // const apiSecret = headersList.get('apiSecret');
  // if (!apiSecret) {
  //   return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  // }
  // if (apiSecret !== process.env.API_SECRET) {
  //   return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  // }

  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: "No name provided" }, { status: 400 });
  }
  const githubOrganizations = await db.select().from(githubOrganization).where(eq(githubOrganization.username, name));

  let developerData = [];

  if (githubOrganizations.length === 0) {
    developerData = await db.select().from(developer).where(eq(developer.name, name));
  } else {
    developerData = await db.select().from(developer).where(eq(developer.name, githubOrganizations[0].username));
  }

  if (developerData.length === 0) {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  }

  return NextResponse.json(developerData[0]);
}

