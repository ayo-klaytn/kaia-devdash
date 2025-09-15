import { NextRequest, NextResponse } from "next/server";

// Mock data for Vercel deployment
const mockDevelopers = [
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
  },
  {
    id: "3",
    name: "Carol Developer", 
    github: "carol-dev",
    address: "0xabcd...efgh",
    communityRank: 3,
    xHandle: "@carol_dev",
    bootcampGraduated: null,
    bootcampContributor: new Date("2024-03-01"),
    nftBadges: ["contributor"],
    ownerOf: [],
    contributorIn: ["kaia-agent-kit"],
    commitsIn: ["kaia-agent-kit"],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-03-01")
  }
];

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Simulate pagination
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = (page - 1) * limit;
  
  const paginatedDevelopers = mockDevelopers.slice(offset, offset + limit);
  
  return NextResponse.json(paginatedDevelopers);
}

export async function POST(): Promise<NextResponse> {
  // For Vercel testing, just return success
  return NextResponse.json({ 
    message: "Mock POST - Developer would be created in production",
    id: "mock-id-" + Date.now()
  });
}

export async function DELETE(): Promise<NextResponse> {
  // For Vercel testing, just return success
  return NextResponse.json({ 
    message: "Mock DELETE - Developer would be deleted in production" 
  });
}

export async function PATCH(): Promise<NextResponse> {
  // For Vercel testing, just return success
  return NextResponse.json({ 
    message: "Mock PATCH - Developer would be updated in production" 
  });
}
