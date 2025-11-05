import 'dotenv/config';
import { getCommitsWithDateRange } from './getCommitsWithDateRange';

/**
 * Crawl historical commits from Klaytn repositories
 * Timeframe: 2023-08-28 to 2024-08-29 (the Klaytn period before transition to Kaia)
 */
export async function getKlaytnHistoricalCommits() {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.error('API_SECRET not found in environment variables');
    return;
  }

  // Klaytn historical timeframe
  const klaytnStartDate = new Date('2023-08-28T00:00:00Z');
  const klaytnEndDate = new Date('2024-08-29T00:00:00Z');

  try {
    // Fetch only Klaytn repositories (marked with remark="klaytn")
    console.log('Fetching Klaytn repositories from database...');
    const repositoriesResponse = await fetch(
      `${baseUrl}/api/data/repositories?page=1&limit=1000&status=active`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apiSecret': apiSecret
        }
      }
    );

    if (!repositoriesResponse.ok) {
      console.error('Failed to fetch repositories:', repositoriesResponse.statusText);
      return;
    }

    const allRepositories = await repositoriesResponse.json();
    
    // Filter to only Klaytn repos
    const klaytnRepos = allRepositories.filter((repo: { remark?: string }) => 
      repo.remark === 'klaytn'
    );
    
    console.log(`Found ${klaytnRepos.length} Klaytn repositories`);
    console.log(`Timeframe: ${klaytnStartDate.toISOString().split('T')[0]} to ${klaytnEndDate.toISOString().split('T')[0]}`);
    console.log('');

    let processedCount = 0;
    let totalCommits = 0;
    let totalErrors = 0;

    for (const repo of klaytnRepos) {
      processedCount++;
      console.log(`[${processedCount}/${klaytnRepos.length}] Processing: ${repo.owner}/${repo.name}`);
      
      try {
        // Fetch historical commits for Klaytn period
        const commits = await getCommitsWithDateRange(
          repo.owner,
          repo.name,
          klaytnStartDate,
          klaytnEndDate
        );
        
        console.log(`  Found ${commits.length} commits in Klaytn period`);
        
        // Insert commits into database
        let insertedCount = 0;
        let skippedCount = 0;
        
        for (const commit of commits) {
          const commitData = {
            repositoryId: repo.id,
            committerName: commit.commit.committer.name,
            committerEmail: commit.commit.committer.email,
            timestamp: commit.commit.committer.date,
            url: commit.html_url,
            sha: commit.sha,
            rawResponse: commit
          };

          try {
            const response = await fetch(`${baseUrl}/api/data/github-commits`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apiSecret': apiSecret
              },
              body: JSON.stringify(commitData)
            });
            
            if (response.ok) {
              insertedCount++;
            } else {
              const errorText = await response.text();
              if (response.status === 400 && errorText.includes('already exists')) {
                skippedCount++;
              } else {
                console.error(`  Failed to insert commit ${commit.sha}: ${response.status} ${errorText}`);
              }
            }
          } catch (commitError) {
            console.error(`  Error inserting commit ${commit.sha}:`, commitError);
          }
        }
        
        console.log(`  ✅ Inserted: ${insertedCount}, ⚠️  Skipped (duplicates): ${skippedCount}`);
        totalCommits += insertedCount;
        
      } catch (error) {
        console.error(`  ❌ Error processing ${repo.owner}/${repo.name}:`, error);
        totalErrors++;
      }
      
      // Add delay between repositories to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('');
    }

    console.log('\n=== Summary ===');
    console.log(`📊 Total repositories processed: ${processedCount}`);
    console.log(`✅ Total commits inserted: ${totalCommits}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log('\nFinished crawling Klaytn historical commits');
    
  } catch (error) {
    console.error('Error in getKlaytnHistoricalCommits:', error);
  }
}

getKlaytnHistoricalCommits();

