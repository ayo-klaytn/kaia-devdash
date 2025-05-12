import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { DiscourseClient } from "@/lib/discourse";


export async function GET(): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret) {
    return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }

  const discourseClient = new DiscourseClient("https://devforum.kaia.io");
  const latestPosts = await discourseClient.getLatestPosts();

  return NextResponse.json(latestPosts);
}

