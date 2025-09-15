import { NextResponse } from "next/server";
import db from "@/lib/db";
import { socialMedia } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(): Promise<NextResponse> {
  // Temporarily disable auth for Vercel testing
  // TODO: Re-enable authentication once we debug the header mismatch
  // const headersList = await headers();
  // const apiSecret = headersList.get("apiSecret");
  // if (process.env.API_SECRET) {
  //   if (!apiSecret) {
  //     return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  //   }
  //   if (apiSecret !== process.env.API_SECRET) {
  //     return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  //   }
  // }


  const kaiaDevInternData = await db
    .select()
    .from(socialMedia)
    .where(eq(socialMedia.name, "kaiadevintern"))
    .limit(365)
    .orderBy(asc(socialMedia.date));

  const socialMediaData = {
    kaiaDevIntern: kaiaDevInternData,
  };

  return NextResponse.json(socialMediaData);
}
