# X/Twitter Posts CSV Upload Guide

This system allows you to automatically update X/Twitter posts on the dashboard by uploading a CSV file.

## Setup

### 1. Create the Database Table

First, run the migration script to create the `x_posts` table:

```bash
bun run scripts/add-x-posts-table.ts
```

Or if using pnpm:
```bash
pnpm tsx scripts/add-x-posts-table.ts
```

### 2. CSV File Format

Create a CSV file named `x-posts.csv` with the following columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Title | ✅ Yes | Post title/description | "Kaia v2.1.0 Announcement" |
| URL | ✅ Yes | Full X/Twitter post URL | "https://x.com/BuildonKaia/status/1983081299431858612" |
| Date | ✅ Yes | Post date in YYYY-MM-DD format | "2025-10-28" |
| Type | ✅ Yes | Content type | "Announcement", "Tutorial", "Event", "Technical", "Integration", "Workshop" |
| Views | ❌ No | View count (supports "k" and "m" suffixes) | "9k", "1.2k", "15k" |
| Likes | ❌ No | Number of likes | "40" |
| Retweets | ❌ No | Number of retweets/reposts | "14" |
| Comments | ❌ No | Number of comments/replies | "3" |
| Account | ❌ No | Account name (defaults to "BuildonKaia") | "BuildonKaia" |

### 3. CSV File Location

Place the CSV file in one of these locations (checked in order):

1. `lib/mocks/x-posts.csv`
2. `lib/data/x-posts.csv`
3. `scripts/x-posts.csv`
4. `x-posts.csv` (project root)

### 4. Upload Posts

#### Option A: Process CSV File (Recommended)

Call the job endpoint to process the CSV file:

```bash
curl -X POST http://localhost:3006/api/jobs/fetch-x-posts \
  -H "Authorization: Bearer YOUR_API_SECRET" \
  -H "Content-Type: application/json"
```

Or with `apiSecret` header:
```bash
curl -X POST http://localhost:3006/api/jobs/fetch-x-posts \
  -H "apiSecret: YOUR_API_SECRET" \
  -H "Content-Type: application/json"
```

#### Option B: Direct API Upload

Upload posts directly via JSON:

```bash
curl -X POST http://localhost:3006/api/data/x-posts \
  -H "apiSecret: YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "title": "Kaia v2.1.0 Announcement",
      "url": "https://x.com/BuildonKaia/status/1983081299431858612",
      "views": "9k",
      "likes": 40,
      "retweets": 14,
      "comments": 3,
      "date": "2025-10-28",
      "type": "Announcement",
      "account": "BuildonKaia"
    }
  ]'
```

## How It Works

1. **Duplicate Detection**: The system extracts the status ID from the URL and checks if the post already exists
2. **Upsert Logic**: 
   - If post exists → Updates the existing record with new data
   - If post is new → Inserts a new record
3. **Automatic Parsing**: Views are automatically parsed (e.g., "9k" → 9000) for sorting purposes

## Scheduled Updates

### Daily/Weekly Updates

You can set up a cron job to automatically process the CSV file:

**Option 1: Vercel Cron Jobs** (if hosted on Vercel)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/jobs/fetch-x-posts",
    "schedule": "0 2 * * *"
  }]
}
```

**Option 2: External Cron Service**

Use services like [cron-job.org](https://cron-job.org) to call:
```
POST https://your-domain.com/api/jobs/fetch-x-posts
Authorization: Bearer YOUR_API_SECRET
```

**Option 3: Manual Trigger**

Simply call the endpoint whenever you update the CSV file.

## CSV Example

```csv
Title,URL,Views,Likes,Retweets,Comments,Date,Type,Account
Kaia v2.1.0 Announcement,https://x.com/BuildonKaia/status/1983081299431858612,9k,40,14,3,2025-10-28,Announcement,BuildonKaia
Cutting Blockchain Storage in Half Deep Dive,https://x.com/BuildonKaia/status/1991417667941732478,5.7k,21,12,8,2025-11-20,Technical,BuildonKaia
Kaia Next Builders November Demo Day Announcement,https://x.com/BuildonKaia/status/1992926174394343719,4.3k,39,15,6,2025-11-24,Event,BuildonKaia
```

## API Endpoints

### GET `/api/view/x-posts`
Fetch posts for display (used by dashboard)

Query params:
- `account` - Filter by account (default: "BuildonKaia")
- `type` - Filter by type
- `limit` - Limit results (default: 1000)

### GET `/api/data/x-posts`
Fetch posts with filtering

Query params:
- `account` - Filter by account
- `type` - Filter by type
- `limit` - Limit results
- `offset` - Pagination offset

### POST `/api/data/x-posts`
Upload posts directly (requires API_SECRET)

### POST `/api/jobs/fetch-x-posts`
Process CSV file and upload posts (requires API_SECRET or CRON_SECRET)

### GET `/api/jobs/fetch-x-posts`
Get information about CSV file locations and format

## Troubleshooting

### CSV File Not Found
- Ensure the file is named exactly `x-posts.csv`
- Check that it's in one of the expected locations
- Call `GET /api/jobs/fetch-x-posts` to see which paths are checked

### Posts Not Appearing
- Check that the database table was created: `bun run scripts/add-x-posts-table.ts`
- Verify the CSV format matches the expected columns
- Check server logs for parsing errors
- Ensure the URL contains a valid status ID (e.g., `/status/1234567890`)

### Duplicate Posts
- The system automatically prevents duplicates by checking the status ID
- If a post exists, it will be updated with new data instead of creating a duplicate

## Notes

- The system extracts the status ID from the URL automatically
- Views are parsed to numbers for sorting (e.g., "9k" → 9000, "1.2k" → 1200)
- Posts are sorted by date (newest first) on the dashboard
- The dashboard will show an empty list if no posts are in the database

