import { Octokit } from 'octokit';

export async function getContributors(owner: string, repo: string) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  });

  try {
    const result = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
      owner: owner,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (result.data) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(`No contributors found for ${owner}/${repo}`);
    console.log(error);
    return [];
  }
}


export async function getContributorsFromRepositories() {
  // call the API to get all the repositories
  const repositories = await fetch(`${process.env.BETTER_AUTH_URL}/api/data/repositories?page=1&limit=1000&status=active`, {
    headers: {
      'Content-Type': 'application/json',
      'apiSecret': process.env.API_SECRET!
    }
  });
  const repositoriesData = await repositories.json();
  console.log(`Found ${repositoriesData.length} repositories`);
  
  // get the commits from each repository
  for (const repo of repositoriesData) {
    try {
      console.log(`Fetching contributors for ${repo.owner}/${repo.name}...`);
      const contributors = await getContributors(repo.owner, repo.name);
      console.log(`Found ${contributors.length} contributors`);
      console.log(contributors);
      
      for (const contributor of contributors) {
        const contributorData = {
          repositoryId: repo.id,
          username: contributor.login,
          contributorId: contributor.id,
          contributorNodeId: contributor.node_id,
          email: contributor.email,
          htmlUrl: contributor.html_url,
          profilePictureUrl: contributor.avatar_url,
          accountType: contributor.type,
          rawResponse: contributor
        }
        console.log(contributorData);
        const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/data/contributors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apiSecret': process.env.API_SECRET!
          },
          body: JSON.stringify(contributorData)
        });
        console.log(response);
      }
      console.log(`Processed contributors for ${repo.owner}/${repo.name}`);
    } catch (error) {
      console.error(`Error processing ${repo.owner}/${repo.name}:`, error);
    }
    // Add a delay between repositories to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

getContributorsFromRepositories();
