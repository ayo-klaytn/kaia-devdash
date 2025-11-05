import 'dotenv/config';
import fs from 'fs';
import path from 'path';

/**
 * Import Klaytn repositories from CSV into the database
 * These repos will be marked with remark="klaytn" to distinguish them from Kaia repos
 */
export default async function populateKlaytnRepositories() {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.error('API_SECRET not found in environment variables');
    return;
  }

  try {
    // Read the Klaytn CSV file
    const csvPath = path.join(process.cwd(), 'lib', 'mocks', 'klaytn-export.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split(/\r?\n/).filter(Boolean);
    
    const repositories: Array<{ owner: string; name: string; url: string }> = [];
    
    // Parse CSV (skip header row)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const urlMatch = line.match(/"(https:\/\/github\.com\/[^\"]+)"/);
      if (!urlMatch) continue;
      
      const url = urlMatch[1];
      const m = url.match(/github\.com\/([^/]+)\/([^/\s]+)$/);
      if (!m) continue;
      
      const owner = m[1];
      const name = m[2];
      
      repositories.push({ owner, name, url });
    }
    
    console.log(`Found ${repositories.length} Klaytn repositories in CSV`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const repo of repositories) {
      const repositoryData = {
        owner: repo.owner,
        name: repo.name,
        url: repo.url,
        status: "active", // Set as active so commits can be fetched
        remark: "klaytn", // Mark as Klaytn to distinguish from Kaia repos
      };
      
      console.log(`Creating Klaytn repository: ${repo.owner}/${repo.name}`);

      try {
        const createResponse = await fetch(`${baseUrl}/api/data/repositories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apiSecret": apiSecret
          },
          body: JSON.stringify(repositoryData)
        });

        if (createResponse.ok) {
          const result = await createResponse.json();
          console.log(`✅ Repository created: ${result.owner}/${result.name}`);
          created++;
        } else {
          const error = await createResponse.json();
          if (error.error === "Repository already exists") {
            console.log(`⚠️  Repository already exists: ${repo.owner}/${repo.name}`);
            skipped++;
          } else {
            console.log(`❌ Failed to create repository: ${error}`);
            errors++;
          }
        }
      } catch (fetchError) {
        console.error(`❌ Fetch error for repository: ${repo.owner}/${repo.name}`, fetchError);
        errors++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n=== Summary ===');
    console.log(`✅ Created: ${created}`);
    console.log(`⚠️  Skipped (already exists): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${repositories.length}`);
    console.log('\nFinished populating Klaytn repositories');
  } catch (error) {
    console.error('Error in populateKlaytnRepositories:', error);
  }
}

populateKlaytnRepositories();

