# GitHub Metrics Cache Setup

This system pre-computes GitHub metrics and stores them in the database for fast retrieval, avoiding 60+ second query timeouts.

## Setup Steps

### 1. Create the Database Table

Make sure you have your `DATABASE_URL` environment variable set, then run:

```bash
# Make sure you're using the same environment as your app
pnpm tsx scripts/add-github-metrics-cache-table.ts
```

If you get a connection error, make sure:
- Your `.env` file has `DATABASE_URL` set
- The database is accessible from your machine
- For production/Vercel, you may need to run this in the same environment

### 2. Compute and Store Metrics

This will compute metrics for all periods and store them in the database:

```bash
pnpm tsx scripts/compute-github-metrics.ts
```

**Note**: This will take several minutes the first time (5-10 minutes depending on data size). Subsequent runs will be faster as it updates existing records.

### 3. Verify It's Working

After running the scripts, refresh your GitHub dashboard page. You should see in the server logs:

```
[GitHub Metrics] ✅ Database cache HIT for period: kaia-2024
```

If you see:
```
[GitHub Metrics] ⚠️ Table github_metrics_cache does not exist
```

Then the table wasn't created. Check the database connection and try step 1 again.

If you see:
```
[GitHub Metrics] ⚠️ Table exists but no cached data for period: kaia-2024
```

Then run step 2 to compute and store the metrics.

### 4. Set Up Periodic Updates (Optional)

To keep the metrics fresh, you can:

1. **Manual refresh**: Run `compute-github-metrics.ts` whenever you want fresh data
2. **Cron job**: Set up a cron job to run it daily/hourly
3. **API endpoint**: Create an API endpoint that triggers the computation (protected by API key)

## Troubleshooting

### Connection Errors

If you get `ECONNREFUSED` errors:
- Check your `DATABASE_URL` environment variable
- Make sure the database is running/accessible
- For Vercel/remote databases, you may need to run scripts from the same environment

### Still Getting Timeouts

If the page still times out after setting up the cache:
1. Check server logs to see if it's using the database cache
2. Verify the table has data: `SELECT COUNT(*) FROM github_metrics_cache;`
3. Make sure the `period_id` matches (e.g., "kaia-2024", "klaytn-2023")

### Data is Stale

Run `compute-github-metrics.ts` again to refresh the data. The script will update existing records.


