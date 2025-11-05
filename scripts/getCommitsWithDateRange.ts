import { Octokit } from '@octokit/rest';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch commits from GitHub with custom date range support
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param sinceDate - Start date (ISO string)
 * @param untilDate - End date (ISO string, optional)
 */
export async function getCommitsWithDateRange(
  owner: string, 
  repo: string,
  sinceDate: Date,
  untilDate?: Date
) {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (!token) {
    console.error('GITHUB_PERSONAL_ACCESS_TOKEN is not set. Authenticated requests are required to avoid rate limits.');
    throw new Error('Missing GITHUB_PERSONAL_ACCESS_TOKEN');
  }

  const octokit = new Octokit({ auth: token });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allCommits: any[] = [];
    let currentPage = 1;
    let hasMoreCommits = true;
    
    while (hasMoreCommits) {
      const params: {
        owner: string;
        repo: string;
        per_page: number;
        page: number;
        since: string;
        until?: string;
      } = {
        owner,
        repo,
        per_page: 100,
        page: currentPage,
        since: sinceDate.toISOString(),
      };

      if (untilDate) {
        params.until = untilDate.toISOString();
      }

      let result;
      try {
        result = await octokit.repos.listCommits(params);
      } catch (e: any) {
        // Handle rate limit: wait until reset and retry
        if (e?.status === 403 && e?.response?.headers?.['x-ratelimit-remaining'] === '0') {
          const reset = Number(e.response.headers['x-ratelimit-reset']);
          const nowSec = Math.floor(Date.now() / 1000);
          const waitMs = Math.max(0, (reset - nowSec + 2) * 1000); // +2s buffer
          const resetDate = new Date(reset * 1000).toISOString();
          console.warn(`Rate limit hit. Waiting until ${resetDate} (~${Math.ceil(waitMs/1000)}s)`);
          await sleep(waitMs);
          // retry once after reset
          result = await octokit.repos.listCommits(params);
        } else {
          throw e;
        }
      }

      const commits = result.data ?? [];
      
      // Filter commits to only include those within our date range
      const filteredCommits = commits.filter(commit => {
        const commitDate = new Date(commit.commit.committer?.date || commit.commit.author?.date || '');
        const isAfterSince = commitDate >= sinceDate;
        const isBeforeUntil = !untilDate || commitDate <= untilDate;
        return isAfterSince && isBeforeUntil;
      });
      
      allCommits = [...allCommits, ...filteredCommits];

      // If we got less than 100 results, we've reached the end
      if (commits.length < 100) {
        hasMoreCommits = false;
      }
      
      // If the oldest commit in this batch is before our since date, stop fetching
      if (commits.length > 0) {
        const oldestCommit = commits[commits.length - 1];
        const oldestDate = new Date(oldestCommit.commit.committer?.date || oldestCommit.commit.author?.date || '');
        if (oldestDate < sinceDate) {
          hasMoreCommits = false;
        }
        
        // If we have an until date and the newest commit is after it, stop fetching
        if (untilDate && filteredCommits.length === 0) {
          // All commits in this batch are after untilDate, stop
          hasMoreCommits = false;
        }
      }

      currentPage++;
      // Add a small delay to avoid rate limiting
      await sleep(300);
    }

    const dateRangeStr = untilDate 
      ? `${sinceDate.toISOString().split('T')[0]} to ${untilDate.toISOString().split('T')[0]}`
      : `since ${sinceDate.toISOString().split('T')[0]}`;
    
    console.log(`Fetched ${allCommits.length} commits from ${owner}/${repo} (${dateRangeStr})`);
    return allCommits;
  } catch (error) {
    console.log(`No commits found for ${owner}/${repo}`);
    console.log(error);
    return [];
  }
}

