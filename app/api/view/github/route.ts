import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository, contributor, repoSummary } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';


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

  // get all repositories with their summaries (fallback to all repos if no summaries)
  let summaries;
  try {
    summaries = await db.select().from(repoSummary)
      .where(eq(repoSummary.window, '28d'))
      .orderBy(desc(repoSummary.lastCommitAt))
      .limit(parseInt(limit))
      .offset(offset);
    
    // If no summaries exist, get all repositories directly
    if (summaries.length === 0) {
      const allRepos = await db.select().from(repository)
        .where(eq(repository.status, status))
        .orderBy(desc(repository.updatedAt))
        .limit(parseInt(limit))
        .offset(offset);
      
      // Convert to summary format
      summaries = allRepos.map(repo => ({
        id: createId(),
        repositoryId: repo.id,
        fullName: `${repo.owner}/${repo.name}`,
        window: '28d',
        commitCount: 0,
        developerCount: 0,
        lastCommitAt: null,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
      }));
    }
  } catch (error) {
    console.error('Error fetching repo summaries:', error);
    // Fallback to all repositories
    const allRepos = await db.select().from(repository)
      .where(eq(repository.status, status))
      .orderBy(desc(repository.updatedAt))
      .limit(parseInt(limit))
      .offset(offset);
    
    summaries = allRepos.map(repo => ({
      id: createId(),
      repositoryId: repo.id,
      fullName: `${repo.owner}/${repo.name}`,
      window: '28d',
      commitCount: 0,
      developerCount: 0,
      lastCommitAt: null,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
    }));
  }
    
  // Optimize: get counts in parallel and cache them
  const [totalRepos, uniqueContributors, uniqueAuthors] = await Promise.all([
    db.select().from(repository).where(eq(repository.status, status)),
    db.select({ contributorId: contributor.contributorId })
      .from(contributor)
      .groupBy(contributor.contributorId),
    db.select({ owner: repository.owner })
      .from(repository)
      .groupBy(repository.owner)
  ]);

  const repositoryCount = totalRepos.length;
  const contributorCount = uniqueContributors.length;
  const authorCount = uniqueAuthors.length;


  responseData.numberOfRepositories = repositoryCount;
  responseData.numberOfContributors = contributorCount;
  responseData.numberOfAuthors = authorCount;
  responseData.repositories = summaries as unknown as typeof repository.$inferSelect[];

  const res = NextResponse.json(responseData);
  res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
  res.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
  res.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600');
  return res;
}