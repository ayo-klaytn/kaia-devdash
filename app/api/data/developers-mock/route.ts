import { NextResponse } from 'next/server'

// Mock data for Vercel testing
const mockDevelopers = [
  {
    id: 1,
    username: 'developer1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar_url: 'https://via.placeholder.com/40',
    followers: 150,
    following: 75,
    public_repos: 25,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'developer2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar_url: 'https://via.placeholder.com/40',
    followers: 200,
    following: 100,
    public_repos: 30,
    created_at: '2019-06-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export async function GET() {
  return NextResponse.json({
    developers: mockDevelopers,
    total: mockDevelopers.length,
    message: 'Mock data for Vercel testing'
  })
}
