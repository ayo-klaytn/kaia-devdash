import { NextResponse } from 'next/server'

// Mock GitHub commits data for Vercel testing
const mockCommits = [
  {
    id: '1',
    sha: 'abc123',
    message: 'Initial commit',
    author: 'developer1',
    date: '2024-01-01T00:00:00Z',
    repository: 'kaia-sdk',
    url: 'https://github.com/kaiachain/kaia-sdk/commit/abc123'
  },
  {
    id: '2', 
    sha: 'def456',
    message: 'Add new feature',
    author: 'developer2',
    date: '2024-01-02T00:00:00Z',
    repository: 'kaia-agent-kit',
    url: 'https://github.com/kaiachain/kaia-agent-kit/commit/def456'
  }
]

export async function GET() {
  return NextResponse.json({
    commits: mockCommits,
    total: mockCommits.length,
    message: 'Mock data for Vercel testing'
  })
}
