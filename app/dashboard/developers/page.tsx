"use client"

import { Package, UserPen, Users } from "lucide-react";
import { useMemo } from "react";
import kaia from "@/lib/mocks/kaia.json";
import { Developer, columns } from "@/app/dashboard/developers/columns"
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
    
    return {
      totalAuthorsWithMoreThan3Repos: authorsWithMoreThan3Repos.length,
      totalDevelopersWithAtLeast1Rank3Repo: 5,
      totalDevelopersWithNftBadges: 10,
      totalDevelopersGraduatingBootcamp: 21,
      totalDevelopersGraduatingBootcampWithContributions: 18,
      totalDevelopersWithAtLeast1RepoWithAtLeast3Stars: uniqueAuthorsWithAtLeast1RepoWithAtLeast3Stars.size,
    }
  }, []);

  const data = useMemo(() => {
    // go through kaia.json the repositories, create an array of unique developers based on the owner field and the contributors field
    const developers = kaia.repositories.map(repo => ({
      name: repo.owner,
      repositories: repo.contributors,
    }));
    // remove duplicates from the developers array with set
    const uniqueDevelopers = Array.from(new Set(developers));

    // turn back into array of developers
    const developersArray = Array.from(uniqueDevelopers);

    // go through the developers array and get the repositories for each developer
    const developersWithRepositories = developersArray.map(dev => ({
      name: dev.name,
      repositories: dev.repositories,
    }));

    // calculate the total commits for each developer based on the commits field in the repositories that has the developer name in the committer field
    const developersWithTotalCommits = developersWithRepositories.map(dev => ({
      name: dev.name,
      totalCommits: kaia.repositories
        .filter(repo => repo.contributors.includes(dev.name))
        .reduce((acc, repo) => acc + repo.commits.filter(commit => commit.committer.name === dev.name).length, 0),
    }));

    // calculate how many times each developer has contributed to a repository based on the original kaia.json object
    const developersWithTotalContributions = developersWithRepositories.map(dev => ({
      name: dev.name,
      totalContributions: kaia.repositories
        .filter(repo => repo.contributors.includes(dev.name))
        .length,
    }));

    // merge the developersWithRepositories, developersWithTotalCommits and developersWithTotalContributions arrays
    const developersWithAllData = developersWithRepositories.map((dev, index) => ({
      id: index + 1,
      name: dev.name,
      repositories: kaia.repositories
        .filter(repo => repo.contributors.includes(dev.name))
        .map(repo => ({
          name: repo.repository,
          owner: repo.owner,
          commitCount: repo.commits.filter(commit => commit.committer.name === dev.name).length,
          lastCommitDate: repo.commits[0]?.timestamp
        })),
      totalContributions: developersWithTotalContributions.find(c => c.name === dev.name)?.totalContributions || 0,
      totalCommits: developersWithTotalCommits.find(c => c.name === dev.name)?.totalCommits || 0,
    }));

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
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
