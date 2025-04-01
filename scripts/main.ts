import fs from 'fs';
import path from 'path';

interface Developer {
  id: number;
  name: string;
  github: string;
  address: string;
  bootcamp: {
    graduated: number;
    contributor: number;
  };
  xrank: number;
}

// Generate a random Ethereum address
const generateRandomAddress = () => {
  return '0x' + Array(40).fill('0123456789abcdef').map(x => x[Math.floor(Math.random() * x.length)]).join('');
};

// Generate a random timestamp within the last year
const generateRandomTimestamp = () => {
  const now = Date.now();
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
  return Math.floor(Math.random() * (now - oneYearAgo) + oneYearAgo);
};

// Read existing data
const inputPath = path.join(__dirname, '../lib/mocks/kaia-developers.json');
const existingData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Generate mock developers while preserving existing names and GitHub URLs
const generateMockDevelopers = (existingDevelopers: Developer[]): Developer[] => {
  return existingDevelopers.map((dev, index) => {
    const graduated = generateRandomTimestamp();
    const contributor = graduated + Math.floor(Math.random() * (30 * 24 * 60 * 60 * 1000)); // Up to 30 days after graduation
    
    return {
      id: index + 1,
      name: dev.name,
      github: dev.github,
      address: generateRandomAddress(),
      bootcamp: {
        graduated,
        contributor
      },
      xrank: Math.floor(Math.random() * 5) + 1
    };
  });
};

const outputPath = path.join(__dirname, '../lib/mocks/kaia-developers.json');
const mockDevelopers = generateMockDevelopers(existingData);

fs.writeFileSync(outputPath, JSON.stringify(mockDevelopers, null, 2));
