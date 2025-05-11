import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { developer } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { asc } from "drizzle-orm";


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
  const limit = searchParams.get('limit') || '1000';
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const responseData: {
    numberOfDevelopers: number;
    numberOfDevelopersWithCommunityRankMoreThan3: number;
    numberOfDevelopersGraduatedBootcamp: number;
    numberOfDevelopersGraduatedBootcampAndContributed: number;
    numberOfDevelopersWithMoreThan3Repositories: number;
    developersWithNftBadges: number
    developersWithAtLeast1Rank3Repository: number
    developersWithAtLeast1RepoWithAtLeast3Stars: number
    numberOfActiveMonthlyDevelopers: number
    developers: typeof developer.$inferSelect[];
  } = {
    numberOfDevelopers: 0,
    numberOfDevelopersWithCommunityRankMoreThan3: 0,
    numberOfDevelopersGraduatedBootcamp: 0,
    numberOfDevelopersGraduatedBootcampAndContributed: 0,
    numberOfDevelopersWithMoreThan3Repositories: 0,
    developersWithNftBadges: 0,
    developersWithAtLeast1Rank3Repository: 0,
    developersWithAtLeast1RepoWithAtLeast3Stars: 0,
    numberOfActiveMonthlyDevelopers: 0,
    developers: []
  }

  // get all repositories
  const developers = await db.select()
    .from(developer)
    .orderBy(asc(developer.name))
    .limit(parseInt(limit))
    .offset(offset);

  const developersWithCommunityRankMoreThan3 = developers.filter((developer) => developer.communityRank && developer.communityRank > 3);
  const developersGraduatedBootcamp = developers.filter((developer) => developer.bootcampGraduated);
  const developerGraduatedBootcampAndContributed = developers.filter((developer) => developer.bootcampGraduated && developer.bootcampContributor);
  
  // get repository count 
  const developerCount = developers.length;
  responseData.numberOfDevelopers = developerCount;
  responseData.numberOfDevelopersWithCommunityRankMoreThan3 = developersWithCommunityRankMoreThan3.length;
  responseData.numberOfDevelopersGraduatedBootcamp = developersGraduatedBootcamp.length;
  responseData.numberOfDevelopersGraduatedBootcampAndContributed = developerGraduatedBootcampAndContributed.length;
  responseData.developers = developers;

  return NextResponse.json(responseData);
}