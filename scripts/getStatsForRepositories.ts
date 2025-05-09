import { Octokit } from 'octokit';

async function getNumberOfStarsForksWatchers(owner: string, repo: string) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  });
  const result = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  });
  return {
    stars: result.data.stargazers_count,
    forks: result.data.forks_count,
    watchers: result.data.watchers_count
  };
}

async function getStatsForRepositories() {
  const hostUrl = process.env.BETTER_AUTH_URL;

  const repositories = await fetch(`${hostUrl}/api/data/repositories?page=1&limit=1000`, {
    headers: {
      "Content-Type": "application/json",
      "apiSecret": process.env.API_SECRET!,
    },
  });

  const repositoriesData = await repositories.json();

  for (const repository of repositoriesData) {
    try {
      const stats = await getNumberOfStarsForksWatchers(repository.owner, repository.name);
    // Update the repository stats
    const response = await fetch(`${hostUrl}/api/data/repository-stats`, {
      method: "POST",
      body: JSON.stringify({
        repositoryId: repository.id,
        stars: stats.stars,
        forks: stats.forks,
        watchers: stats.watchers,
      }),
      headers: {
        "Content-Type": "application/json",
        "apiSecret": process.env.API_SECRET!,
      },
    });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
    // Wait 1 second before next iteration
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
getStatsForRepositories();

