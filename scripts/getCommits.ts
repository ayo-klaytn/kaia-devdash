import { Octokit } from 'octokit';

export async function getCommits(owner: string, repo: string) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allCommits: any[] = [];
    let currentPage = 1;
    let hasMoreCommits = true;
    
    while (hasMoreCommits) {
      const result = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        },
        per_page: 100,
        page: currentPage
      });

      const commits = result.data || [];
      allCommits = [...allCommits, ...commits];

      // If we got less than 100 results, we've reached the end
      if (commits.length < 100) {
        hasMoreCommits = false;
      }

      currentPage++;
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return allCommits;
  } catch (error) {
    console.log(`No commits found for ${owner}/${repo}`);
    console.log(error);
    return [];
  }
}


export async function getCommitsFromRepositories() {
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
      console.log(`Fetching commits for ${repo.owner}/${repo.name}...`);
      const commits = await getCommits(repo.owner, repo.name);
      console.log(`Found ${commits.length} commits`);
      console.log(commits);
      // Insert commits directly into the database
      for (const commit of commits) {
        const commitData = {
          repositoryId: repo.id,
          committerName: commit.commit.committer.name,
          committerEmail: commit.commit.committer.email,
          timestamp: commit.commit.committer.date,
          url: commit.html_url,
          sha: commit.sha,
          rawResponse: commit
        }
        console.log(commitData);
        const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/data/github-commits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apiSecret': process.env.API_SECRET!
          },
          body: JSON.stringify(commitData)
        });
        console.log(response);
      }
      
      console.log(`Processed commits for ${repo.owner}/${repo.name}`);
    } catch (error) {
      console.error(`Error processing ${repo.owner}/${repo.name}:`, error);
    }
    // Add a delay between repositories to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

getCommitsFromRepositories();
