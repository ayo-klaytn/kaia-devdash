import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

export const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
});

interface RepositoryRecord {
  id: number;
  owner: string;
  repository: string;
  contributors: string[];
}

export async function getRateLimitStatus() {
  const result = await octokit.request('GET /rate_limit', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  console.log('Rate limit status:', result.data);
  return result.data;
}

// Convert TOML to JSON
export async function convertTomlToJson() {
  const tomlContent = fs.readFileSync('src/kaia.toml', 'utf-8');

  // Parse sub_ecosystems
  const subEcosystemsMatch = tomlContent.match(/sub_ecosystems = \[([\s\S]*?)\]/);
  if (!subEcosystemsMatch) throw new Error('Could not find sub_ecosystems section');
  const subEcosystems = subEcosystemsMatch[1]
    .split('\n')
    .filter(line => line.includes('"'))
    .map(line => line.trim().replace(/"/g, '').replace(/,/g, ''));

  // Parse github_organizations
  const githubOrgsMatch = tomlContent.match(/github_organizations = \[([\s\S]*?)\]/);
  if (!githubOrgsMatch) throw new Error('Could not find github_organizations section');
  const githubOrgs = githubOrgsMatch[1]
    .split('\n')
    .filter(line => line.includes('"'))
    .map(line => line.trim().replace(/"/g, '').replace(/,/g, ''));

  // Parse repositories
  const repoMatches = tomlContent.match(/\[\[repo\]\]\nurl = "(.+?)"/g);
  if (!repoMatches) throw new Error('Could not find repository entries');
  
  const repos = repoMatches.map((match, index) => {
    const urlMatch = match.match(/url = "(.+?)"/);
    if (!urlMatch) throw new Error(`Could not parse URL from repository entry ${index + 1}`);
    
    const repoMatch = urlMatch[1].match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) throw new Error(`Invalid GitHub URL format in entry ${index + 1}`);
    
    const [, owner, repository] = repoMatch;
    return {
      id: index + 1,
      owner,
      repository
    };
  });

  const jsonContent = {
    sub_ecosystems: subEcosystems,
    github_organizations: githubOrgs,
    repositories: repos
  };

  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
  console.log('Successfully created kaia.json');
}

export async function getContributors(owner: string, repo: string) {
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

export async function getNumberOfRepositoriesInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  console.log('Total number of repositories: ', jsonContent.repositories.length);
}

export async function getNumberOfAuthorsInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  // get all owners of repositories with no duplicates
  const owners = jsonContent.repositories.map((repo: RepositoryRecord) => repo.owner);
  const uniqueOwners = [...new Set(owners)];
  console.log('Total number of unique authors: ', uniqueOwners.length);
}

async function getNumberOfStarsForksWatchers(owner: string, repo: string) {
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

export async function getNumberOfStarsForksWatchersFromRepositoriesInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  console.log('Starting to fetch stats for all repositories...');
  const totalRepos = jsonContent.repositories.length;
  let processedRepos = 0;

  // get the number of stars for each repository
  for (const repo of jsonContent.repositories) {
    processedRepos++;
    console.log(`Fetching stats for ${repo.owner}/${repo.repository} (${processedRepos}/${totalRepos})`);
    const stats = await getNumberOfStarsForksWatchers(repo.owner, repo.repository);
    repo.stats = stats;
    console.log(`Stats for ${repo.owner}/${repo.repository}: ${JSON.stringify(stats)}`);
    // Wait 1 second before next iteration
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Writing updated stats to kaia.json...');
  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
  console.log('Successfully updated repository stats');
}

export async function getContributorsFromRepositoriesInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  // use getContributors for each repository and get the contributors login names, add them to the kaia.json file as a new field called contributors
  for (const repo of jsonContent.repositories) {
    const contributors = await getContributors(repo.owner, repo.repository);
    repo.contributors = contributors.length > 0 
      ? contributors.map((contributor: { login?: string }) => contributor.login || '')
      : [];
    console.log(repo);
  }
  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
}

export async function getNumberOfContributorsInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  // get the total number of unique contributors in the kaia.json file
  const contributors = jsonContent.repositories.map((repo: RepositoryRecord) => repo.contributors);
  const uniqueContributors = [...new Set(contributors.flat())];
  console.log('Total number of unique contributors: ', uniqueContributors.length);
}

export async function getCommits(owner: string, repo: string) {
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

export async function getCommitsFromRepositoriesInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  // get the commits from each repository
  for (const repo of jsonContent.repositories) {
    try {
      console.log(`Fetching commits for ${repo.owner}/${repo.repository}...`);
      const commits = await getCommits(repo.owner, repo.repository);
      // Filter commit data to only keep committer, timestamp and url
      repo.commits = commits.map(commit => ({
        committer: commit.commit.committer,
        timestamp: commit.commit.committer.date,
        url: commit.html_url
      }));
      // Save after each successful repository fetch
      fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
      console.log(`Saved commits for ${repo.owner}/${repo.repository}`);
    } catch (error) {
      console.error(`Error processing ${repo.owner}/${repo.repository}:`, error);
      // Save even if there was an error, so we don't lose previous progress
      fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
    }
    // Add a delay between repositories to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export async function test() {
  const commits = await getCommits('zxstim', 'bifrost-io');
  console.log(JSON.stringify(commits, null, 2));
}

export async function removeRepositoriesByOwners(ownersToRemove: string[]) {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  
  // Filter out repositories with specified owners
  jsonContent.repositories = jsonContent.repositories.filter(
    (repo: RepositoryRecord) => !ownersToRemove.includes(repo.owner)
  );

  // Reindex the IDs to maintain sequential order
  jsonContent.repositories = jsonContent.repositories.map((repo: RepositoryRecord, index: number) => ({
    ...repo,
    id: index + 1
  }));

  // Save the filtered content back to the file
  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
  console.log(`Successfully removed repositories owned by: ${ownersToRemove.join(', ')}`);
}

export async function removeRepositoriesByNames(namesToRemove: string[]) {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  jsonContent.repositories = jsonContent.repositories.filter(
    (repo: RepositoryRecord) => !namesToRemove.includes(repo.repository)
  );

  // Reindex the IDs to maintain sequential order
  jsonContent.repositories = jsonContent.repositories.map((repo: RepositoryRecord, index: number) => ({
    ...repo,
    id: index + 1
  }));

  // Save the filtered content back to the file
  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
  console.log(`Successfully removed repositories named: ${namesToRemove.join(', ')}`);
}


export async function getCommunityStatisticsTraffic(owner: string, repo: string) {
  // get community profile metrics
  const resultCommunityProfile = await octokit.request('GET /repos/{owner}/{repo}/community/profile', {
    owner,
    repo,
  });
  // get traffic metrics
  const resultTrafficViews = await octokit.request('GET /repos/{owner}/{repo}/traffic/views', {
    owner,
    repo,
  });
  // get popular paths
  const resultTrafficReferrers = await octokit.request('GET /repos/{owner}/{repo}/traffic/popular/paths', {
    owner,
    repo,
  });
  // get popular referrers
  const resultTrafficClones = await octokit.request('GET /repos/{owner}/{repo}/traffic/popular/referrers', {
    owner,
    repo,
  });
  return {
    communityHealth: resultCommunityProfile.data.health_percentage,
    trafficViews: resultTrafficViews.data,
    trafficReferrers: resultTrafficReferrers.data,
    trafficClones: resultTrafficClones.data
  };
}
export async function getGithubMetricsForDevRelRepo() {
  const devrelRepo = 'kaia-dapp-mono';
  const devrelOwner = 'kaiachain';
  const devrelRepoData = await getCommunityStatisticsTraffic(devrelOwner, devrelRepo);
  console.log(JSON.stringify(devrelRepoData, null, 2));
  // save to devrel_repo in kaia.json
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  jsonContent.devrel_repo = devrelRepoData;
  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
}