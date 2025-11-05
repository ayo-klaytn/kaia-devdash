# Klaytn Historical Data Import Guide

This guide explains how to import Klaytn repositories and their historical commits to enable accurate Year-over-Year (YoY) analysis.

## Overview

The system separates Klaytn and Kaia repositories:
- **Klaytn repos**: Marked with `remark="klaytn"`, historical timeframe: 2023-08-28 to 2024-08-29
- **Kaia repos**: All other repos, timeframe: 2024-08-29 onwards

## Scripts

### 1. `populateKlaytnRepositories.ts`
Imports Klaytn repositories from CSV into the database.

**What it does:**
- Reads `lib/mocks/klaytn-export.csv`
- Parses GitHub repository URLs
- Creates repository entries with `remark="klaytn"`
- Sets status to "active" so commits can be fetched

**Usage:**
```bash
npx tsx scripts/populateKlaytnRepositories.ts
```

**Output:**
- Creates Klaytn repos in database
- Marks them with `remark="klaytn"` to distinguish from Kaia repos

---

### 2. `getCommitsWithDateRange.ts`
Helper function for fetching commits with custom date ranges.

**What it does:**
- Fetches commits from GitHub API
- Supports start date (since) and end date (until)
- Handles pagination automatically
- Includes rate limiting protection

**Parameters:**
- `owner`: Repository owner
- `repo`: Repository name
- `sinceDate`: Start date (Date object)
- `untilDate`: End date (Date object, optional)

---

### 3. `getKlaytnHistoricalCommits.ts`
Crawls historical commits from Klaytn repositories.

**What it does:**
- Fetches all repos with `remark="klaytn"`
- Fetches commits from 2023-08-28 to 2024-08-29
- Stores commits in database
- Skips duplicates automatically

**Usage:**
```bash
npx tsx scripts/getKlaytnHistoricalCommits.ts
```

**Timeframe:**
- Start: 2023-08-28T00:00:00Z
- End: 2024-08-29T00:00:00Z

---

### 4. `getCommits.ts` (Updated)
Crawls commits from Kaia repositories.

**What it does:**
- Fetches all repos EXCEPT those with `remark="klaytn"`
- Fetches commits from 2024-08-29 onwards
- Stores commits in database

**Usage:**
```bash
npx tsx scripts/getCommits.ts
```

**Timeframe:**
- Start: 2024-08-29T00:00:00Z
- End: Now (no end date)

---

## Step-by-Step Import Process

### Step 1: Import Klaytn Repositories
```bash
npx tsx scripts/populateKlaytnRepositories.ts
```

This will:
- Read the CSV file
- Create repository entries in the database
- Mark them as `remark="klaytn"`

### Step 2: Fetch Klaytn Historical Commits
```bash
npx tsx scripts/getKlaytnHistoricalCommits.ts
```

This will:
- Fetch all Klaytn repos
- Get commits from 2023-08-28 to 2024-08-29
- Store them in the database

### Step 3: Fetch Kaia Commits (if needed)
```bash
npx tsx scripts/getCommits.ts
```

This will:
- Fetch all Kaia repos (non-Klaytn)
- Get commits from 2024-08-29 onwards
- Store them in the database

---

## Environment Variables Required

Make sure these are set in your `.env` file:

```env
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token
API_SECRET=your_api_secret
BETTER_AUTH_URL=http://localhost:3006  # or your production URL
NEXT_PUBLIC_BASE_URL=http://localhost:3006  # or your production URL
```

---

## Data Separation

### Repository Marking
- **Klaytn repos**: `remark="klaytn"`
- **Kaia repos**: `remark="external"` or other values

### Commit Timeframes
- **Klaytn commits**: 2023-08-28 to 2024-08-29
- **Kaia commits**: 2024-08-29 onwards

### Query Logic
The YoY calculation automatically:
- Queries commits by date range
- No filtering needed (all commits are in the same table)
- For previous period (2023-08-28 to 2024-08-29): Gets Klaytn commits
- For current period (2024-08-29 to now): Gets Kaia commits

---

## Notes

1. **Rate Limiting**: All scripts include delays to respect GitHub API rate limits
2. **Duplicate Handling**: Commits are deduplicated by SHA hash
3. **Error Handling**: Scripts continue processing even if individual repos fail
4. **Progress Tracking**: Scripts show detailed progress and summaries

---

## Verification

After importing, you can verify the data:

1. Check Klaytn repos:
   ```sql
   SELECT COUNT(*) FROM repository WHERE remark = 'klaytn';
   ```

2. Check Klaytn commits:
   ```sql
   SELECT COUNT(*) FROM commit c
   JOIN repository r ON c.repository_id = r.id
   WHERE r.remark = 'klaytn'
   AND c.timestamp >= '2023-08-28T00:00:00Z'
   AND c.timestamp < '2024-08-29T00:00:00Z';
   ```

3. Check Kaia commits:
   ```sql
   SELECT COUNT(*) FROM commit c
   JOIN repository r ON c.repository_id = r.id
   WHERE r.remark != 'klaytn'
   AND c.timestamp >= '2024-08-29T00:00:00Z';
   ```

---

## Troubleshooting

### CSV not found
- Ensure `lib/mocks/klaytn-export.csv` exists
- Check the file path is correct

### Rate limiting errors
- Increase delays in scripts (currently 300-500ms)
- Use GitHub Personal Access Token with higher rate limits

### Database connection errors
- Check `BETTER_AUTH_URL` is correct
- Verify `API_SECRET` matches your environment

### Missing commits
- Check GitHub token permissions
- Verify repository visibility (private repos need token access)
- Check date ranges match expected timeframes

