import 'dotenv/config';

export default async function getDevelopers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.error('API_SECRET not found in environment variables');
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/api/data/contributors?page=1&limit=1200`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apiSecret": apiSecret
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch contributors: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Found ${data.length} contributors to process`);
    
    for (const contributor of data) {
      const developerData = {
        name: contributor.username,
        github: contributor.htmlUrl,
        address: null,
        communityRank: null,
        xHandle: null,
        bootcampGraduated: null,
        bootcampContributor: null,
      }
      console.log('Creating developer:', developerData);

      const createResponse = await fetch(`${baseUrl}/api/data/developers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apiSecret": apiSecret
        },
        body: JSON.stringify(developerData)
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log('Developer created:', result);
      } else {
        const error = await createResponse.json();
        console.log('Failed to create developer:', error);
      }
    }
    
    console.log('Finished processing developers');
  } catch (error) {
    console.error('Error in getDevelopers:', error);
  }
}

getDevelopers();