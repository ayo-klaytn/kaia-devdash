"use client"

import { useMemo } from "react";
import { authClient } from "@/lib/auth-client" // import the auth client
import UnauthorizedComponent from "@/components/unauthorized";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, UserPen, Users } from "lucide-react";

// data import
import kaia from "@/lib/mocks/kaia.json"
import kaiaDevelopers from "@/lib/mocks/kaia-developers.json";
import webTrafficData from "@/lib/mocks/kaia-docs-webtraffic.json";;

// types
import { Repository } from "@/app/dashboard/github/columns";



export default function Dashboard() {
  const { 
    data: session, 
    isPending, // loading state
    error, // error object
  } = authClient.useSession() 

  const data = useMemo(() => 
    kaia.repositories as Repository[],
    [] // Empty dependency array since kaia is static
  );

  const githubStats = useMemo(() => {
    const uniqueOwners = new Set(data.map(repo => repo.owner));
    const uniqueContributors = new Set(data.flatMap(repo => repo.contributors));

    return {
      totalRepositories: data.length,
      totalAuthors: uniqueOwners.size,
      totalContributors: uniqueContributors.size
    };
  }, [data]);

  const developersStats = useMemo(() => {
    // go through kaia.json and get the number of authors with more than 3 repositories
    const authors = kaia.repositories.map(repo => repo.owner);
    const uniqueAuthors = new Set(authors);
    const authorsWithMoreThan3Repos = Array.from(uniqueAuthors).filter(author => authors.filter(a => a === author).length > 3);

    // go through kaia.json and get the number of authors with at least 1 repository with at least 3 stars
    const authorsWithAtLeast1RepoWithAtLeast3Stars = kaia.repositories.filter(repo => repo.stats.stars >= 3).map(repo => repo.owner);
    const uniqueAuthorsWithAtLeast1RepoWithAtLeast3Stars = new Set(authorsWithAtLeast1RepoWithAtLeast3Stars);
    
    // go through kaia-developers.json and get the number of developers graduating bootcamp
    const developersGraduatingBootcamp = kaiaDevelopers.filter(dev => dev.bootcamp.graduated);
    const developersGraduatingBootcampWithContributions = developersGraduatingBootcamp.filter(dev => dev.bootcamp.contributor);
    const developersWithCommunityRankMoreThan3 = kaiaDevelopers.filter(dev => dev.community_rank >= 3);

    return {
      totalAuthorsWithMoreThan3Repos: authorsWithMoreThan3Repos.length,
      totalDevelopersWithAtLeast1Rank3Repo: 5,
      totalDevelopersWithNftBadges: 10,
      totalDevelopersGraduatingBootcamp: developersGraduatingBootcamp.length,
      totalDevelopersGraduatingBootcampWithContributions: developersGraduatingBootcampWithContributions.length,
      totalDevelopersWithAtLeast1RepoWithAtLeast3Stars: uniqueAuthorsWithAtLeast1RepoWithAtLeast3Stars.size,
      totalDevelopersWithCommunityRankMoreThan3: developersWithCommunityRankMoreThan3.length,
      totalDevelopers: kaiaDevelopers.length,
      totalMonthlyActiveDevelopers: (() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 1);
        
        // Get all commits from the current month
        const monthlyCommits = kaia.repositories.flatMap(repo => 
          repo.commits.filter(commit => {
            const commitDate = new Date(commit.timestamp);
            return commitDate >= firstDayOfMonth && commitDate <= now;
          })
        );

        // Get unique committers from these commits
        const monthlyCommitters = new Set(
          monthlyCommits.map(commit => commit.committer.name.toLowerCase())
        );

        return monthlyCommitters.size;
      })()
    }
  }, []);

  const webTrafficStats = useMemo(() => {
    return {
      totalViews: webTrafficData.overview.views.value,
      totalVisits: webTrafficData.overview.visits.value,
      totalVisitors: webTrafficData.overview.visitors.value
    }
  }, []);
  
  
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    )
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  if (session?.user?.emailVerified) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Summary of key metrics.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{githubStats.totalRepositories}</h1>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <p className="text-sm">Repositories</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{githubStats.totalAuthors}</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Authors</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{githubStats.totalContributors}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Contributors</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{developersStats.totalDevelopers}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Total developers</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{developersStats.totalMonthlyActiveDevelopers}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Monthly active developers</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{developersStats.totalDevelopersGraduatingBootcamp}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Developers graduating bootcamp</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{webTrafficStats.totalViews}</h1>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <p className="text-sm">Views</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{webTrafficStats.totalVisits}</h1>
            <div className="flex items-center gap-2">
              <UserPen className="w-4 h-4" />
              <p className="text-sm">Visits</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 border rounded-md p-4">
            <h1 className="text-2xl font-bold">{webTrafficStats.totalVisitors}</h1>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <p className="text-sm">Visitors</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
 
  return <UnauthorizedComponent />
}