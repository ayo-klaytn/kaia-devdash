import 'dotenv/config';
import fs from 'fs';
import path from 'path';

interface KaiaRepo {
  url: string;
  name?: string;
  description?: string;
}

interface KaiaData {
  repo: KaiaRepo[];
}

export default async function populateRepositories() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.error('API_SECRET not found in environment variables');
    return;
  }

  try {
    // Read the kaia.toml file
    const tomlPath = path.join(__dirname, 'kaia.toml');
    const tomlContent = fs.readFileSync(tomlPath, 'utf8');
    
    // Simple parsing for the TOML structure we need
    const repoMatches = tomlContent.match(/url = "([^"]+)"/g);
    const repositories: KaiaRepo[] = [];
    
    if (repoMatches) {
      for (const match of repoMatches) {
        const url = match.match(/url = "([^"]+)"/)?.[1];
        if (url) {
          repositories.push({ url });
        }
      }
    }
    
    console.log(`Found ${repositories.length} repositories in kaia.toml`);
    
    for (const repo of repositories) {
      const owner = repo.url.split("/")[3];
      const name = repo.url.split("/")[4];
      const url = repo.url;
      
      const repositoryData = {
        owner,
        name,
        url,
        status: "active", // Set as active so contributors can be fetched
        remark: "external",
      };
      
      console.log('Creating repository:', `${owner}/${name}`);

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
          console.log('✅ Repository created:', result.owner + '/' + result.name);
        } else {
          const error = await createResponse.json();
          if (error.error === "Repository already exists") {
            console.log('⚠️  Repository already exists:', `${owner}/${name}`);
          } else {
            console.log('❌ Failed to create repository:', error);
          }
        }
      } catch (fetchError) {
        console.error('❌ Fetch error for repository:', `${owner}/${name}`, fetchError);
      }
    }
    
    console.log('Finished populating repositories');
  } catch (error) {
    console.error('Error in populateRepositories:', error);
  }
}

populateRepositories();





