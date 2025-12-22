# X/Twitter Auto-Update Plan

## Current State
- Developer content is **hardcoded** in `app/dashboard/x/page.tsx` (lines 97-467)
- No database table for storing X/Twitter posts
- Analytics data comes from CSV (`bok-analytics.csv`)
- Existing job pattern: `/app/api/jobs/` endpoints for scheduled tasks

## Options for Fetching X/Twitter Posts

### Option 1: Twitter API v2 (Recommended if you have API access)
**Pros:**
- Official, reliable, real-time data
- Access to engagement metrics (likes, retweets, views, etc.)
- Can filter by account, date range, keywords

**Cons:**
- Requires Twitter Developer account
- API keys and OAuth 2.0 setup needed
- Rate limits (varies by tier)
- May require paid tier for full access

**Implementation:**
- Use `twitter-api-v2` npm package
- Store credentials in environment variables
- Fetch posts from `@BuildonKaia` account daily

### Option 2: Manual CSV Upload (Hybrid Approach)
**Pros:**
- No API setup needed
- You control what gets displayed
- Can curate/classify posts manually

**Cons:**
- Requires manual work
- Not fully automated

**Implementation:**
- Create API endpoint to accept CSV uploads
- Parse and store in database
- Run daily to check for new CSV files

### Option 3: Web Scraping (Not Recommended)
**Pros:**
- No API keys needed
- Can extract public data

**Cons:**
- Against X/Twitter Terms of Service
- Fragile (breaks when HTML changes)
- Legal/ethical concerns
- Rate limiting issues

### Option 4: Third-Party Service
**Pros:**
- Pre-built solutions
- Often includes analytics

**Cons:**
- Additional cost
- Dependency on external service
- May have limitations

## Recommended Architecture

### 1. Database Schema
Create a new table `x_posts` to store:
- Post ID (Twitter status ID)
- Title/Text content
- URL
- Views, Likes, Retweets, Comments
- Post date
- Content type (Announcement, Tutorial, Event, etc.)
- Account (BuildonKaia, KaiaDevIntern, etc.)
- Created/Updated timestamps

### 2. API Endpoints

#### `/api/data/x-posts` (GET)
- Fetch all posts from database
- Support filtering by date, type, account
- Used by the dashboard page

#### `/api/data/x-posts` (POST)
- Manual upload endpoint
- Accept JSON array of posts
- Upsert logic (update if exists, insert if new)

#### `/api/jobs/fetch-x-posts` (POST)
- Scheduled job endpoint
- Fetches new posts from Twitter API
- Updates database
- Can be called via:
  - Vercel Cron Jobs
  - External cron service (cron-job.org, etc.)
  - Manual trigger

### 3. Scheduled Job Setup

**Option A: Vercel Cron Jobs** (if hosted on Vercel)
```json
// vercel.json
{
  "crons": [{
    "path": "/api/jobs/fetch-x-posts",
    "schedule": "0 2 * * *"  // Daily at 2 AM
  }]
}
```

**Option B: External Cron Service**
- Use services like cron-job.org
- Call the API endpoint daily with API secret

**Option C: GitHub Actions**
- Scheduled workflow to call API endpoint

### 4. Page Update
- Modify `app/dashboard/x/page.tsx`
- Replace hardcoded array with database fetch
- Keep same UI/UX

## Implementation Steps

### Phase 1: Database Setup
1. Add `xPosts` table to schema
2. Create migration
3. Run migration

### Phase 2: API Endpoints
1. Create `/api/data/x-posts` (GET/POST)
2. Create `/api/jobs/fetch-x-posts` (POST)
3. Add Twitter API integration (if using Option 1)

### Phase 3: Update Dashboard
1. Modify `app/dashboard/x/page.tsx` to fetch from API
2. Test with existing data
3. Ensure backward compatibility

### Phase 4: Automation
1. Set up cron job (Vercel/external)
2. Test daily fetch
3. Monitor and log errors

## Questions to Answer

1. **Do you have Twitter API access?**
   - If yes → Use Option 1 (Twitter API v2)
   - If no → Use Option 2 (CSV upload) or explore API access

2. **What accounts should we track?**
   - `@BuildonKaia` (main)
   - `@KaiaDevIntern` (secondary)
   - Others?

3. **What content should be included?**
   - All posts?
   - Only developer-focused posts?
   - Filter by keywords/hashtags?

4. **How should we classify posts?**
   - Auto-detect from content?
   - Manual classification?
   - Use existing types (Announcement, Tutorial, Event, etc.)?

5. **Update frequency?**
   - Daily (recommended)
   - Multiple times per day?
   - Real-time (webhook)?

## Next Steps

1. **Decide on approach** (API vs CSV vs hybrid)
2. **Set up Twitter API** (if going with Option 1)
3. **Create database schema**
4. **Build API endpoints**
5. **Update dashboard page**
6. **Set up automation**

Would you like me to start implementing based on your preferences?

