import 'dotenv/config';
import fs from 'fs';
import path from 'path';

interface MockDeveloper {
  id: number;
  name: string;
  github: string;
  address: string;
  bootcamp: {
    graduated: number;
    contributor: number;
  };
  community_rank: number;
  x_handle: string | null;
}

export default async function populateDevelopers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3006';
  const apiSecret = process.env.API_SECRET;
  
  if (!apiSecret) {
    console.error('API_SECRET not found in environment variables');
    return;
  }

  try {
    // Read the mock data - fix the path to go up one directory from scripts
    const mockDataPath = path.join(__dirname, '..', 'lib', 'mocks', 'kaia-developers.json');
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8')) as MockDeveloper[];
    
    console.log(`Found ${mockData.length} developers in mock data`);
    
    for (const mockDev of mockData) {
      // Convert timestamp to Date objects - only if they're valid numbers
      let bootcampGraduated: Date | null = null;
      let bootcampContributor: Date | null = null;
      
      if (mockDev.bootcamp.graduated && mockDev.bootcamp.graduated > 0) {
        try {
          bootcampGraduated = new Date(mockDev.bootcamp.graduated);
          // Validate the date
          if (isNaN(bootcampGraduated.getTime())) {
            bootcampGraduated = null;
          }
        } catch (e) {
          bootcampGraduated = null;
        }
      }
      
      if (mockDev.bootcamp.contributor && mockDev.bootcamp.contributor > 0) {
        try {
          bootcampContributor = new Date(mockDev.bootcamp.contributor);
          // Validate the date
          if (isNaN(bootcampContributor.getTime())) {
            bootcampContributor = null;
          }
        } catch (e) {
          bootcampContributor = null;
        }
      }
      
      const developerData = {
        name: mockDev.name,
        github: mockDev.github,
        address: mockDev.address,
        communityRank: mockDev.community_rank,
        xHandle: mockDev.x_handle,
        bootcampGraduated: bootcampGraduated ? bootcampGraduated.toISOString() : null,
        bootcampContributor: bootcampContributor ? bootcampContributor.toISOString() : null,
        nftBadges: null,
        ownerOf: null,
        contributorIn: null,
        commitsIn: null,
      };
      
      console.log('Creating developer:', developerData.name);

      try {
        const createResponse = await fetch(`${baseUrl}/api/data/developers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apiSecret": apiSecret
          },
          body: JSON.stringify(developerData)
        });

        console.log('Response status:', createResponse.status);

        if (createResponse.ok) {
          const responseText = await createResponse.text();
          
          if (responseText) {
            try {
              const result = JSON.parse(responseText);
              console.log('✅ Developer created:', result.name);
            } catch (parseError) {
              console.log('⚠️  Response not valid JSON, but status was OK:', responseText);
            }
          } else {
            console.log('⚠️  Empty response body');
          }
        } else {
          const responseText = await createResponse.text();
          console.log('❌ API Error Status:', createResponse.status);
          console.log('❌ Response body:', responseText);
          
          if (responseText) {
            try {
              const error = JSON.parse(responseText);
              if (error.error === "Developer already exists") {
                console.log('⚠️  Developer already exists:', developerData.name);
              } else {
                console.log('❌ API Error:', error);
              }
            } catch (parseError) {
              console.log('❌ Could not parse error response:', responseText);
            }
          }
        }
      } catch (fetchError) {
        console.error('❌ Fetch error for developer:', developerData.name, fetchError);
      }
    }
    
    console.log('Finished populating developers');
  } catch (error) {
    console.error('Error in populateDevelopers:', error);
  }
}

populateDevelopers();
