// Utility functions for Vercel deployment

export const isVercel = process.env.VERCEL === '1';
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Mock data for Vercel
export const mockData = {
  developers: [
    {
      id: "1",
      name: "Alice Johnson",
      github: "alice-dev",
      address: "0x1234...5678",
      communityRank: 1,
      xHandle: "@alice_dev",
      bootcampGraduated: new Date("2024-01-15"),
      bootcampContributor: new Date("2024-02-01"),
      nftBadges: ["early-adopter", "contributor"],
      ownerOf: ["kaia-nft-1"],
      contributorIn: ["kaia-sdk", "kaia-agent-kit"],
      commitsIn: ["kaia-sdk", "kaia-agent-kit"],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15")
    },
    {
      id: "2", 
      name: "Bob Smith",
      github: "bob-crypto",
      address: "0x8765...4321",
      communityRank: 2,
      xHandle: "@bob_crypto",
      bootcampGraduated: new Date("2024-02-01"),
      bootcampContributor: null,
      nftBadges: ["early-adopter"],
      ownerOf: ["kaia-nft-2"],
      contributorIn: ["kaia-sdk"],
      commitsIn: ["kaia-sdk"],
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-02-01")
    }
  ],
  commits: [
    {
      id: "1",
      sha: "abc123",
      message: "Initial commit",
      author: "alice-dev",
      date: "2024-01-01T00:00:00Z",
      repository: "kaia-sdk",
      url: "https://github.com/kaiachain/kaia-sdk/commit/abc123"
    },
    {
      id: "2", 
      sha: "def456",
      message: "Add new feature",
      author: "bob-crypto",
      date: "2024-01-02T00:00:00Z",
      repository: "kaia-agent-kit",
      url: "https://github.com/kaiachain/kaia-agent-kit/commit/def456"
    }
  ]
};

export function getMockResponse(data: any, message?: string) {
  return {
    data,
    message: message || "Mock data for Vercel testing",
    environment: "vercel"
  };
}
