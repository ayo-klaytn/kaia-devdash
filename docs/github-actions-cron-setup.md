# GitHub Actions Cron Setup Guide

This guide walks you through setting up automated daily aggregation of GitHub metrics using GitHub Actions.

## Overview

The GitHub Actions workflow runs daily at 2 AM UTC to:
1. **Aggregate GitHub metrics** → Stores in `githubMetricsCache` table (for `/dashboard/github`)
2. **Aggregate developer summaries** → Stores in `developerSummary` and `madCache28d` tables (for `/dashboard/developers`)

This ensures your dashboard always shows fresh, pre-computed metrics without slow page loads.

---

## Step-by-Step Setup

### Step 1: Add GitHub Repository Secrets

GitHub Actions needs access to your database and API secrets. These are stored securely in your GitHub repository settings.

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO`

2. **Open Settings → Secrets and variables → Actions**
   - Click on your repo → **Settings** tab
   - In the left sidebar, click **Secrets and variables** → **Actions**

3. **Add the following secrets** (click "New repository secret" for each):

   #### Required Secrets:

   **`DATABASE_URL`**
   - Your Supabase Postgres connection string
   - Example: `postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Where to find it**: Your `.env.local` file or Supabase dashboard → Settings → Database → Connection string

   **`API_SECRET`**
   - The secret key you use for `/api/jobs/*` authentication
   - Same value as your Vercel `API_SECRET` environment variable
   - **Where to find it**: Your `.env.local` file

   **`BETTER_AUTH_URL`**
   - Your production Vercel URL (where your app is deployed)
   - Example: `https://your-app.vercel.app`
   - **Note**: This is needed for the `aggregate-github` API call

   #### Optional Secrets:

   **`GITHUB_TOKEN`** (only if you want to automate commit fetching)
   - Personal Access Token for GitHub API (higher rate limits)
   - **How to create**:
     1. Go to: https://github.com/settings/tokens
     2. Click "Generate new token (classic)"
     3. Name: `devrel-dashboard-cron`
     4. Scopes: `public_repo` (read-only) is usually enough
     5. Generate and copy the token
   - **Note**: If you're not automating commit fetching, you can skip this

---

### Step 2: Verify the Workflow File

The workflow file is already created at:
```
.github/workflows/github-metrics-cron.yml
```

**What it does:**
- Runs daily at 2 AM UTC
- Installs Bun and dependencies
- Runs `scripts/compute-github-metrics.ts` (aggregates into `githubMetricsCache`)
- Calls `/api/jobs/aggregate-github` (aggregates into `developerSummary`, `madCache28d`)

**You can customize the schedule** by editing the `cron` line:
```yaml
- cron: '0 2 * * *'  # minute hour day month day-of-week
```

Common schedules:
- `'0 2 * * *'` - Daily at 2 AM UTC
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * 0'` - Weekly on Sunday at midnight

---

### Step 3: Commit and Push

1. **Commit the workflow file** (if not already committed):
   ```bash
   git add .github/workflows/github-metrics-cron.yml
   git commit -m "Add GitHub Actions cron for metrics aggregation"
   git push
   ```

2. **Verify it's in your repo**:
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/.github/workflows/`
   - You should see `github-metrics-cron.yml`

---

### Step 4: Test the Workflow (Manual Trigger)

Before waiting for the scheduled run, test it manually:

1. **Go to GitHub Actions tab**
   - In your repo, click the **Actions** tab

2. **Find the workflow**
   - You should see "GitHub Metrics Cron" in the left sidebar
   - Click on it

3. **Run workflow manually**
   - Click "Run workflow" button (top right)
   - Select the branch (usually `main` or `master`)
   - Click "Run workflow"

4. **Monitor the run**
   - Click on the running workflow to see live logs
   - Wait for it to complete (usually 1-5 minutes)
   - Check for any errors

5. **Verify success**
   - Green checkmark = success ✅
   - Red X = failure ❌ (check logs for errors)

---

### Step 5: Verify Data in Your Dashboard

After a successful run:

1. **Check your dashboard pages**:
   - `/dashboard/github` → Should show fresh metrics from `githubMetricsCache`
   - `/dashboard/developers` → Should show fresh MAD/new devs from `developerSummary` and `madCache28d`

2. **Check the database** (optional):
   ```sql
   -- Check githubMetricsCache
   SELECT * FROM github_metrics_cache ORDER BY updated_at DESC LIMIT 5;
   
   -- Check developerSummary
   SELECT * FROM developer_summary ORDER BY updated_at DESC LIMIT 5;
   
   -- Check madCache28d
   SELECT * FROM mad_cache_28d ORDER BY date DESC LIMIT 5;
   ```

---

## Troubleshooting

### Workflow fails with "DATABASE_URL not found"

**Problem**: The script can't find `DATABASE_URL` environment variable.

**Solution**:
- Make sure you added `DATABASE_URL` to GitHub Secrets (Step 1)
- Double-check the secret name is exactly `DATABASE_URL` (case-sensitive)
- Verify the connection string is valid (test it locally first)

### Workflow fails with "Unauthorized" when calling API

**Problem**: The `aggregate-github` API endpoint rejects the request.

**Solution**:
- Make sure `API_SECRET` is set in GitHub Secrets
- Verify `BETTER_AUTH_URL` points to your production Vercel URL
- Check that your Vercel app has `API_SECRET` set in environment variables

### Workflow times out

**Problem**: The job takes longer than 30 minutes.

**Solution**:
- Increase `timeout-minutes` in the workflow file (default is 6 hours, but we set 30 for safety)
- Check if your database is slow or if there are too many commits to process
- Consider running the aggregation less frequently (e.g., every 12 hours instead of daily)

### Workflow runs but dashboard shows old data

**Problem**: The aggregation completes, but pages still show stale data.

**Solution**:
- Check that the workflow actually wrote to the database (see Step 5)
- Verify your pages are reading from the correct tables:
  - `/dashboard/github` → `githubMetricsCache`
  - `/dashboard/developers` → `developerSummary` and `madCache28d`
- Clear Next.js cache (if using `revalidate`, wait for the revalidation window)

---

## Optional: Automate Commit Fetching

If you want to also automate fetching new commits from GitHub (currently manual), you can add a separate job:

1. **Create a new workflow file**: `.github/workflows/fetch-github-commits.yml`
2. **Schedule it to run before aggregation** (e.g., 1 AM UTC)
3. **Run `scripts/getCommits.ts`** to fetch new commits

**Note**: This requires:
- `GITHUB_TOKEN` secret (for higher rate limits)
- `BETTER_AUTH_URL` and `API_SECRET` (for calling your API endpoints)
- More time (can take 10-30 minutes depending on repo count)

---

## Monitoring

### View Workflow History

- Go to: **Actions** tab → **GitHub Metrics Cron**
- See all past runs, success/failure, and execution time

### Set Up Notifications

GitHub will email you if a workflow fails (if you have notifications enabled):
- Settings → Notifications → Actions → Check "Workflow runs"

---

## Summary

✅ **What you've set up:**
- Daily automated aggregation of GitHub metrics
- Pre-computed summaries for fast dashboard loads
- No manual intervention needed

✅ **What happens daily:**
1. 2 AM UTC: GitHub Actions triggers
2. Runs aggregation scripts
3. Updates database tables
4. Dashboard shows fresh data (after Next.js revalidation)

✅ **Next steps:**
- Monitor the first few runs
- Adjust schedule if needed
- Optionally add commit fetching automation

---

## Questions?

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Verify all secrets are set correctly
3. Test the scripts locally first: `bun tsx scripts/compute-github-metrics.ts`
