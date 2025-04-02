"use client"

import { Package, UserPen, Users } from "lucide-react";
import { useMemo } from "react";
import kaia from "@/lib/mocks/kaia.json";
import kaiaDevelopers from "@/lib/mocks/kaia-developers.json";
import { columns } from "@/app/dashboard/developers/columns"
import { DataTable } from "@/app/dashboard/developers/data-table"

export default function DevelopersPage() {

  const stats = useMemo(() => {
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
      totalDevelopers: kaiaDevelopers.length
    }
  }, []);

  const data = useMemo(() => {
    // Extract unique developers from both owners and contributors
    const allDevelopers = new Set([
      ...kaia.repositories.map(repo => repo.owner),
      ...kaia.repositories.flatMap(repo => repo.contributors)
    ]);

    // Create developer objects with complete repository data
    const developersWithAllData = Array.from(allDevelopers).map((developerName, index) => {
      // Find all repositories where developer is either owner or contributor
      const developerRepos = kaia.repositories.filter(repo => 
        repo.owner === developerName || repo.contributors.includes(developerName)
      );

      return {
        id: index + 1,
        name: developerName,
        repositories: developerRepos.map(repo => ({
          name: repo.repository,
          owner: repo.owner,
          commitCount: repo.commits.filter(commit => 
            commit.committer.name === developerName.toLowerCase()
          ).length,
          lastCommitDate: repo.commits
            .filter(commit => commit.committer.name === developerName.toLowerCase())
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp
        })),
        totalContributions: developerRepos.length,
        totalCommits: developerRepos.reduce((total, repo) => 
          total + repo.commits.filter(commit => 
            commit.committer.name === developerName.toLowerCase()
          ).length, 
        0)
      };
    });

    // return the developersWithAllData array
    return developersWithAllData;
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Developers</h1>
        <p className="text-sm text-muted-foreground">
          View developers and their metrics.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalAuthorsWithMoreThan3Repos}</h1>
          <div className="flex items-center gap-2">
            <UserPen className="w-4 h-4" />
            <p className="text-sm">Authors with more than 3 repositories</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalDevelopersWithAtLeast1Rank3Repo}</h1>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <p className="text-sm">Developers with at least 1 rank 3 repo</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalDevelopersWithNftBadges}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Developers with NFT badges</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalDevelopersGraduatingBootcamp}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Developers graduating bootcamp</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalDevelopersGraduatingBootcampWithContributions}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Devs graduating bootcamp turned contributors</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalDevelopersWithAtLeast1RepoWithAtLeast3Stars}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Devs with at least 1 repo with at least 3 stars</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalDevelopers}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Total developers</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h1 className="text-2xl font-bold">{stats.totalDevelopersWithCommunityRankMoreThan3}</h1>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-sm">Developers with community rank more than 3</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
