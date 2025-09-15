import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository, contributor } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";


export async function GET(request: NextRequest): Promise<NextResponse> {
  // Temporarily disable auth for Vercel testing
  // TODO: Re-enable authentication once we debug the header mismatch
  // const headersList = await headers();
  // const apiSecret = headersList.get('apiSecret');
  // if (process.env.API_SECRET) {
  //   if (!apiSecret) {
  //     return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  //   }
  //   if (apiSecret !== process.env.API_SECRET) {
  //     return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  //   }
  // }

  // return paginated list of repositories
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '1000';
  const status = searchParams.get('status') || 'active';
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const responseData: {
    numberOfRepositories: number;
    numberOfContributors: number;
    numberOfAuthors: number;
    repositories: typeof repository.$inferSelect[];
  } = {
    numberOfRepositories: 0,
    numberOfContributors: 0,
    numberOfAuthors: 0,
    repositories: []
  }

  // get all repositories (newest first)
  const repositoriesList = await db.select()
    .from(repository)
    .where(eq(repository.status, status))
    .orderBy(desc(repository.createdAt))
    .limit(parseInt(limit))
    .offset(offset);
    
  // get unique contributors
  const uniqueContributors = await db
    .select()
    .from(
      db.select({ contributorId: contributor.contributorId })
        .from(contributor)
        .groupBy(contributor.contributorId)
        .as('distinct_contributors')
    );

  // get all unique authors
  const uniqueAuthors = await db.select()
    .from(
      db.select({ owner: repository.owner })
        .from(repository)
        .groupBy(repository.owner)
        .as('distinct_authors')
    );

  // get repository count
  const repositoryCount = repositoriesList.length;

  const contributorCount = uniqueContributors.length;

  const authorCount = uniqueAuthors.length;


  responseData.numberOfRepositories = repositoryCount;
  responseData.numberOfContributors = contributorCount;
  responseData.numberOfAuthors = authorCount;
  responseData.repositories = repositoriesList;

  return NextResponse.json(responseData);
}