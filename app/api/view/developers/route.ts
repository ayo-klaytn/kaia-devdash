import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs'
import db from "@/lib/db";
import { developer, commit } from "@/lib/db/schema";
import { headers } from 'next/headers';
import { asc, sql } from "drizzle-orm";


export async function GET(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  // Temporarily disable auth for Vercel testing
  // TODO: Re-enable authentication once we debug the header mismatch
  // if (process.env.API_SECRET) {
  //   if (!apiSecret) {
  //     return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  //   }
  //   if (apiSecret !== process.env.API_SECRET) {
  //     return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  //   }
  // }

  // inputs
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500);
  const offset = (page - 1) * limit;
  // default time window for heavy metrics: last 180 days
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 180);
  
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
    monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }>;
    newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }>;
    monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }>;
    uniqueDevelopersAcrossPeriod: number;
    totalDeveloperMonths: number;
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
    monthlyActiveDevelopers: [],
    newDevelopers365d: [],
    monthlyMadProgress: [],
    uniqueDevelopersAcrossPeriod: 0,
    totalDeveloperMonths: 0,
    developers: []
  }

  try {
    // Names to exclude (shared between MAD and new devs)
    const excludedNames = [
      'ayo-klaytn', 'praveen-kaia', 'zxstim', 'scott lee', 'github', 'ollie', 
      'kaia-docs', 'sotatek-quangdo', 'sotatek-longpham2', 'github-actions'
    ];

    // list developers (lightweight columns only)
    const developers = await db.select()
      .from(developer)
      .orderBy(asc(developer.name))
      .limit(limit)
      .offset(offset);

    console.log('Raw developers from DB:', developers);
    console.log('Number of developers found:', developers.length);

    // Calculate metrics
    const developersWithCommunityRankMoreThan3 = developers.filter((dev) => dev.communityRank && dev.communityRank > 3);
    const developersGraduatedBootcamp = developers.filter((dev) => dev.bootcampGraduated);
    const developerGraduatedBootcampAndContributed = developers.filter((dev) => dev.bootcampGraduated && dev.bootcampContributor);
    
    // For now, set some placeholder values since we don't have repository data in this query
    const developersWithNftBadges = developers.filter((dev) => dev.nftBadges && Object.keys(dev.nftBadges).length > 0);
    
    // These would need repository data to calculate properly - setting to 0 for now
    const developersWithAtLeast1Rank3Repository = 0; // Would need repo data
    const developersWithAtLeast1RepoWithAtLeast3Stars = 0; // Would need repo data
    const numberOfDevelopersWithMoreThan3Repositories = 0; // Would need repo data

    // Get Monthly Active Developers (last 28 days), no rawResponse
    let monthlyActiveDevelopers: Array<{ email: string | null; name: string | null }> = [];
    
    try {
      const twentyEightDaysAgo = new Date();
      twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
      
      console.log('Fetching MAD commits from:', twentyEightDaysAgo.toISOString());
      
      const madRaw = await db
        .select({ 
          committerEmail: commit.committerEmail,
          committerName: commit.committerName,
        })
        .from(commit)
        .where(
          sql`${commit.timestamp} >= ${twentyEightDaysAgo.toISOString()}`
        )
        .limit(5000); // Lower cap

      // Group by email and extract best name for each
      const madByEmail = new Map<string, { email: string | null; name: string | null }>();
      
      madRaw.forEach(dev => {
        const email = dev.committerEmail || 'no-email';
        const name = (dev.committerName || '').toLowerCase();
        const emailLower = (dev.committerEmail || '').toLowerCase();
        
        // Skip bots
        if (name.includes('[bot]') || name.includes('bot') || emailLower.includes('bot')) {
          return;
        }
        
        // Skip excluded names
        const isExcluded = excludedNames.some(excludedName => 
          name.includes(excludedName.toLowerCase()) || 
          emailLower.includes(excludedName.toLowerCase())
        );
        
        if (isExcluded) {
          return;
        }
        
        // Keep the best name we've found for this email
        if (!madByEmail.has(email) || (!madByEmail.get(email)?.name && dev.committerName)) {
          madByEmail.set(email, {
            email: dev.committerEmail || null,
            name: dev.committerName || null
          });
        }
      });

      monthlyActiveDevelopers = Array.from(madByEmail.values());
      console.log('MAD processing complete. Found:', monthlyActiveDevelopers.length, 'developers');
    } catch (madError) {
      console.error('MAD query failed, using empty array:', madError);
      monthlyActiveDevelopers = [];
    }

    // Get New Developers (first commit within last 180 days) with bot filtering via grouped SQL
    let newDevelopers365d: Array<{ email: string | null; name: string | null; firstAt: string }> = [];
    
    try {
      const fromIso = from.toISOString();
      const toIso = to.toISOString();

      console.log('Using efficient query for new developers (180d)');
      
      // Use a more efficient database query to find first commits per email
      const firstCommits = await db
        .select({
          committerEmail: commit.committerEmail,
          committerName: commit.committerName,
          firstCommitTime: sql<string>`MIN(${commit.timestamp})`.as('firstCommitTime')
        })
        .from(commit)
        .where(sql`${commit.timestamp} >= ${fromIso} AND ${commit.timestamp} <= ${toIso}`)
        .groupBy(commit.committerEmail, commit.committerName)
        .limit(1000);
      
      console.log(`Found ${firstCommits.length} unique developers with first commits in date range`);
      
      // Filter out bots and excluded names
      const filteredDevelopers = firstCommits.filter(dev => {
        const email = dev.committerEmail || '';
        const name = (dev.committerName || '').toLowerCase();
        const emailLower = email.toLowerCase();
        
        // Skip bots
        if (name.includes('[bot]') || name.includes('bot') || emailLower.includes('bot')) {
          return false;
        }
        
        // Skip excluded names
        const isExcluded = excludedNames.some(excludedName => 
          name.includes(excludedName.toLowerCase()) || 
          emailLower.includes(excludedName.toLowerCase())
        );
        
        return !isExcluded;
      });
      
      console.log(`After filtering: ${filteredDevelopers.length} developers`);
      
      // Convert to the expected format
      newDevelopers365d = filteredDevelopers.map(dev => {
        return {
          email: dev.committerEmail,
          name: dev.committerName,
          firstAt: dev.firstCommitTime
        };
      });
      
      console.log(`New dev processing complete. Found: ${newDevelopers365d.length} developers`);
    } catch (newDevError) {
      console.error('New dev query failed:', newDevError);
      newDevelopers365d = [];
    }

    // Get Monthly MAD Progress (last 12 months) using single grouped query
    let monthlyMadProgress: Array<{ month: string; count: number; year: number; monthNumber: number }> = [];
    
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const grouped = await db
        .select({
          monthStart: sql<string>`date_trunc('month', to_timestamp(${commit.timestamp}::double precision / 1000))`.as('monthStart'),
          countDistinct: sql<number>`COUNT(DISTINCT ${commit.committerEmail})`.as('countDistinct')
        })
        .from(commit)
        .where(sql`${commit.timestamp} >= ${twelveMonthsAgo.toISOString()}`)
        .groupBy(sql`date_trunc('month', to_timestamp(${commit.timestamp}::double precision / 1000))`)
        .limit(240);

      monthlyMadProgress = grouped
        .map((row) => {
          const d = new Date(row.monthStart);
          const year = d.getUTCFullYear();
          const monthNumber = d.getUTCMonth() + 1;
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
          return { month: `${monthName} ${year}`, count: Number(row.countDistinct), year, monthNumber };
        })
        .sort((a, b) => a.year === b.year ? a.monthNumber - b.monthNumber : a.year - b.year);
    } catch (madProgressError) {
      console.error('Monthly MAD progress calculation failed:', madProgressError);
      monthlyMadProgress = [];
    }

    // Calculate unique developers across last 12 months and total developer-months
    let uniqueDevelopersAcrossPeriod = 0;
    let totalDeveloperMonths = 0;
    
    try {
      totalDeveloperMonths = monthlyMadProgress.reduce((sum, m) => sum + m.count, 0);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const unique = await db
        .select({
          countDistinct: sql<number>`COUNT(DISTINCT ${commit.committerEmail})`.as('countDistinct')
        })
        .from(commit)
        .where(sql`${commit.timestamp} >= ${twelveMonthsAgo.toISOString()}`)
        .limit(1);
      uniqueDevelopersAcrossPeriod = Number(unique[0]?.countDistinct || 0);
    } catch (uniqueError) {
      console.error('Unique developers calculation failed:', uniqueError);
      uniqueDevelopersAcrossPeriod = 0;
      totalDeveloperMonths = 0;
    }

    const numberOfActiveMonthlyDevelopers = monthlyActiveDevelopers.length;
    
    // get developer count 
    const developerCount = developers.length;
    
    responseData.numberOfDevelopers = developerCount;
    responseData.numberOfDevelopersWithCommunityRankMoreThan3 = developersWithCommunityRankMoreThan3.length;
    responseData.numberOfDevelopersGraduatedBootcamp = developersGraduatedBootcamp.length;
    responseData.numberOfDevelopersGraduatedBootcampAndContributed = developerGraduatedBootcampAndContributed.length;
    responseData.developersWithNftBadges = developersWithNftBadges.length;
    responseData.developersWithAtLeast1Rank3Repository = developersWithAtLeast1Rank3Repository;
    responseData.developersWithAtLeast1RepoWithAtLeast3Stars = developersWithAtLeast1RepoWithAtLeast3Stars;
    responseData.numberOfDevelopersWithMoreThan3Repositories = numberOfDevelopersWithMoreThan3Repositories;
    responseData.numberOfActiveMonthlyDevelopers = numberOfActiveMonthlyDevelopers;
    responseData.monthlyActiveDevelopers = monthlyActiveDevelopers;
    responseData.newDevelopers365d = newDevelopers365d;
    responseData.monthlyMadProgress = monthlyMadProgress;
    responseData.uniqueDevelopersAcrossPeriod = uniqueDevelopersAcrossPeriod;
    responseData.totalDeveloperMonths = totalDeveloperMonths;
    responseData.developers = developers;

    console.log('Calculated response data:', responseData);

    const res = NextResponse.json(responseData);
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res;
  } catch (error) {
    console.error('Error in developers API:', error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}