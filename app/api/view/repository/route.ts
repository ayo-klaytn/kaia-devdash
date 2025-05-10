import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository, contributor, commit, repositoryStats } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { eq } from "drizzle-orm";


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
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
  }

  const responseData: {
    repository: typeof repository.$inferSelect;
    contributors: typeof contributor.$inferSelect[];
    commits: typeof commit.$inferSelect[];
    repositoryStats: typeof repositoryStats.$inferSelect[];
  } = {
    repository: {} as typeof repository.$inferSelect,
    contributors: [] as typeof contributor.$inferSelect[],
    commits: [] as typeof commit.$inferSelect[],
    repositoryStats: [] as typeof repositoryStats.$inferSelect[]
  };

  if (id) {
    // get repository join with commits and contributors
    const repositoryData = await db.select()
      .from(repository)
      .where(eq(repository.id, id));

    const contributorOfRepository = await db.select()
      .from(contributor)
      .where(eq(contributor.repositoryId, id));

    const commitOfRepository = await db.select()
      .from(commit)
      .where(eq(commit.repositoryId, id));

    const repositoryStatsData = await db.select()
      .from(repositoryStats)
      .where(eq(repositoryStats.repositoryId, id));

    responseData.repository = repositoryData[0];
    responseData.contributors = contributorOfRepository;
    responseData.commits = commitOfRepository;
    responseData.repositoryStats = repositoryStatsData;
  }

  return NextResponse.json(responseData);
}