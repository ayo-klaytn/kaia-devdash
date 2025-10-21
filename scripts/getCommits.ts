import { Octokit } from '@octokit/rest';

export async function getCommits(owner: string, repo: string) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  });

  try {
    // Fetch commits from September 1, 2024 onwards (full year of data)
    const sinceDate = new Date('2024-09-01T00:00:00Z');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allCommits: any[] = [];
    let currentPage = 1;
    let hasMoreCommits = true;
    
    while (hasMoreCommits) {
      const result = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 100,
        page: currentPage,
        since: sinceDate.toISOString(), // Fetch commits since Sept 1, 2024 (full year)
      });

      const commits = result.data ?? [];
      
      // Filter commits to only include those from Sept 2024 onwards
      const recentCommits = commits.filter(commit => {
        const commitDate = new Date(commit.commit.committer?.date || commit.commit.author?.date || '');
        return commitDate >= sinceDate;
      });
      
      allCommits = [...allCommits, ...recentCommits];

      // If we got less than 100 results, we've reached the end
      if (commits.length < 100) {
        hasMoreCommits = false;
      }
      
      // If the oldest commit in this batch is before our cutoff, stop fetching
      if (commits.length > 0) {
        const oldestCommit = commits[commits.length - 1];
        const oldestDate = new Date(oldestCommit.commit.committer?.date || oldestCommit.commit.author?.date || '');
        if (oldestDate < sinceDate) {
          hasMoreCommits = false;
        }
      }

      currentPage++;
      // Add a small delay to avoid rate limiting (reduced for faster crawling)
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`Fetched ${allCommits.length} commits from ${owner}/${repo} (since Sept 1, 2024)`);
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
  let processedCount = 0;
  for (const repo of repositoriesData) {
    processedCount++;
    console.log(`Processing ${processedCount}/${repositoriesData.length}: ${repo.owner}/${repo.name}`);
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
        
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 400 && errorText.includes('already exists')) {
            // Skip duplicate commits silently
            continue;
          }
          console.error(`Failed to insert commit ${commit.sha}: ${response.status} ${errorText}`);
        }
      }
      
      console.log(`Processed commits for ${repo.owner}/${repo.name}`);
    } catch (error) {
      console.error(`Error processing ${repo.owner}/${repo.name}:`, error);
    }
    // Add a delay between repositories to avoid rate limiting (reduced for faster crawling)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

getCommitsFromRepositories();
