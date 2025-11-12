import 'dotenv/config';
import { Octokit } from '@octokit/rest';
import db from '@/lib/db';
import { developer } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Fetch location data from GitHub API for top contributors
 * This script enriches developer records with location data from their GitHub profiles
 */

const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_PERSONAL_ACCESS_TOKEN is required');
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Rate limit: 5000 requests/hour for authenticated requests
// We'll add delays to be safe
const DELAY_MS = 100; // 100ms between requests = ~10 requests/second max

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract GitHub username from email or GitHub URL
 */
function extractGitHubUsername(email: string, githubUrl?: string | null): string | null {
  // If we have a GitHub URL, extract username from it
  if (githubUrl) {
    const match = githubUrl.match(/github\.com\/([^\/]+)/);
    if (match) {
      return match[1];
    }
  }

  // Try to extract from email (some emails are username@users.noreply.github.com)
  const noreplyMatch = email.match(/^(\d+\+)?([^@]+)@users\.noreply\.github\.com$/);
  if (noreplyMatch) {
    return noreplyMatch[2];
  }

  return null;
}

/**
 * Find GitHub username from contributor table by email
 */
async function findGitHubUsernameFromContributor(email: string): Promise<string | null> {
  try {
    const { contributor } = await import('@/lib/db/schema');
    const contributors = await db
      .select({ username: contributor.username })
      .from(contributor)
      .where(sql`LOWER(${contributor.email}) = ${email.toLowerCase()}`)
      .limit(1);
    
    if (contributors.length > 0 && contributors[0].username) {
      return contributors[0].username;
    }
    return null;
  } catch (error) {
    console.error(`  ⚠️  Error querying contributor table:`, error);
    return null;
  }
}

/**
 * Try to find GitHub username from commit author name (heuristic)
 * Some commits have author names that match GitHub usernames
 */
async function findGitHubUsernameFromCommits(email: string, name: string): Promise<string | null> {
  try {
    const { commit } = await import('@/lib/db/schema');
    // Look for commits by this email and see if committer_name looks like a GitHub username
    const commits = await db
      .select({ committerName: commit.committerName })
      .from(commit)
      .where(sql`LOWER(TRIM(${commit.committerEmail})) = ${email.toLowerCase()}`)
      .limit(10);
    
    // If committer name looks like a GitHub username (no spaces, alphanumeric + hyphens/underscores)
    for (const c of commits) {
      if (c.committerName && /^[a-zA-Z0-9_-]+$/.test(c.committerName)) {
        return c.committerName;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch user location from GitHub API
 */
async function fetchGitHubLocation(username: string): Promise<string | null> {
  try {
    const { data } = await octokit.rest.users.getByUsername({
      username,
    });

    return data.location || null;
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`  ⚠️  User not found: ${username}`);
      return null;
    }
    if (error.status === 403) {
      console.log(`  ⚠️  Rate limited for: ${username}`);
      // Check rate limit
      try {
        const { data: rateLimit } = await octokit.rest.rateLimit.get();
        console.log(`  Rate limit: ${rateLimit.remaining}/${rateLimit.limit} (resets at ${new Date(rateLimit.reset * 1000).toISOString()})`);
      } catch {
        // Rate limit endpoint might not be available
      }
      throw new Error('Rate limited');
    }
    console.error(`  ❌ Error fetching ${username}:`, error.message);
    return null;
  }
}

/**
 * Normalize location string to country (simple heuristic)
 */
function normalizeLocation(location: string | null): string | null {
  if (!location) return null;

  // Common country patterns (case-insensitive)
  const countryPatterns: Record<string, string> = {
    'united states': 'United States',
    'usa': 'United States',
    'us': 'United States',
    'south korea': 'South Korea',
    'korea': 'South Korea',
    'vietnam': 'Vietnam',
    'singapore': 'Singapore',
    'japan': 'Japan',
    'china': 'China',
    'india': 'India',
    'united kingdom': 'United Kingdom',
    'uk': 'United Kingdom',
    'germany': 'Germany',
    'france': 'France',
    'canada': 'Canada',
    'australia': 'Australia',
    'brazil': 'Brazil',
    'indonesia': 'Indonesia',
    'philippines': 'Philippines',
    'thailand': 'Thailand',
    'malaysia': 'Malaysia',
  };

  const lowerLocation = location.toLowerCase();

  // Check for exact country matches
  for (const [pattern, country] of Object.entries(countryPatterns)) {
    if (lowerLocation.includes(pattern)) {
      return country;
    }
  }

  // If no match, return the original location (could be a city)
  return location;
}

async function fetchTopContributorsLocations() {
  console.log('🚀 Starting to fetch developer locations...\n');

  // Get top contributors from the API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  let contributors: Array<{
    email: string;
    name: string;
    commitCount: number;
    lastCommitAt: string | null;
    location: string | null;
  }> = [];

  try {
    const response = await fetch(`${baseUrl}/api/view/top-contributors?limit=100&days=365`);
    if (response.ok) {
      const data = await response.json();
      contributors = data.contributors || [];
      console.log(`📊 Found ${contributors.length} top contributors\n`);
    } else {
      console.error('❌ Failed to fetch top contributors from API');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error fetching top contributors:', error);
    process.exit(1);
  }

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < contributors.length; i++) {
    const contrib = contributors[i];
    console.log(`[${i + 1}/${contributors.length}] Processing: ${contrib.name} (${contrib.email})`);

    // Try to find existing developer record
    const existingDev = await db
      .select()
      .from(developer)
      .where(sql`LOWER(${developer.github}) LIKE ${`%${contrib.email.split('@')[0]}%`}`)
      .limit(1);

    // Try multiple methods to find GitHub username
    let githubUsername = extractGitHubUsername(contrib.email, existingDev[0]?.github || null);
    
    // If not found, try contributor table
    if (!githubUsername) {
      githubUsername = await findGitHubUsernameFromContributor(contrib.email);
      if (githubUsername) {
        console.log(`  📍 Found username from contributor table: ${githubUsername}`);
      }
    }
    
    // If still not found, try to infer from commit author names
    if (!githubUsername && contrib.name) {
      githubUsername = await findGitHubUsernameFromCommits(contrib.email, contrib.name);
      if (githubUsername) {
        console.log(`  📍 Inferred username from commits: ${githubUsername}`);
      }
    }

    if (!githubUsername) {
      console.log(`  ⚠️  Could not find GitHub username, skipping`);
      skippedCount++;
      continue;
    }

    // Check if we already have location for this developer
    if (existingDev.length > 0 && existingDev[0].location) {
      console.log(`  ✅ Already has location: ${existingDev[0].location}`);
      updatedCount++;
      continue;
    }

    // Fetch location from GitHub
    try {
      const location = await fetchGitHubLocation(githubUsername);
      
      if (location) {
        const normalizedLocation = normalizeLocation(location);
        console.log(`  ✅ Location: ${location} → ${normalizedLocation}`);

        // Update or create developer record
        if (existingDev.length > 0) {
          await db
            .update(developer)
            .set({
              location: normalizedLocation,
              updatedAt: new Date(),
            })
            .where(sql`${developer.id} = ${existingDev[0].id}`);
        } else {
          // Create new developer record
          const devId = `dev_${githubUsername}_${Date.now()}`;
          await db.insert(developer).values({
            id: devId,
            name: contrib.name,
            github: `https://github.com/${githubUsername}`,
            location: normalizedLocation,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        updatedCount++;
      } else {
        console.log(`  ⚠️  No location found`);
        skippedCount++;
      }

      // Rate limiting: wait between requests
      if (i < contributors.length - 1) {
        await sleep(DELAY_MS);
      }
    } catch (error: any) {
      if (error.message === 'Rate limited') {
        console.log('\n⏸️  Rate limited. Waiting 1 hour...');
        await sleep(3600000); // Wait 1 hour
        i--; // Retry this contributor
        continue;
      }
      console.error(`  ❌ Error:`, error.message);
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Updated: ${updatedCount}`);
  console.log(`⚠️  Skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('\n✨ Done!');
}

fetchTopContributorsLocations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

