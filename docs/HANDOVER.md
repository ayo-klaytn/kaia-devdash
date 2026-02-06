# DevRel Dashboard - Handover Guide

## Overview

This guide provides a complete handover for the Kaia DevRel Dashboard project, including architecture, database setup, scripts, migration procedures, and operational workflows.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema & Setup](#database-schema--setup)
3. [Environment Variables & Configuration](#environment-variables--configuration)
4. [Data Flow & Component Interconnections](#data-flow--component-interconnections)
5. [Scripts Reference](#scripts-reference)
6. [Database Migration Guide](#database-migration-guide)
7. [Deployment & Infrastructure](#deployment--infrastructure)
8. [Automated Jobs & Cron](#automated-jobs--cron)
9. [Troubleshooting & Operations](#troubleshooting--operations)
10. [Development Workflow](#development-workflow)

---

## 1. System Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Shadcn UI, TailwindCSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth (email/password)
- **Runtime**: Bun (package manager + runtime)
- **Deployment**: Vercel
- **Automation**: GitHub Actions (cron jobs)

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │   Services   │  │
│  │ (Server      │  │   (Client)   │  │  (Shared)    │  │
│  │ Components)  │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  /api/view/* │  │ /api/data/*  │  │ /api/jobs/*  │  │
│  │  (Read-only) │  │  (CRUD ops)  │  │ (Background) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ github-      │  │  developers  │  │ social-media │  │
│  │ metrics.ts    │  │    .ts       │  │    .ts       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Raw Data   │  │   Cache      │  │   Summary    │  │
│  │  (commits,   │  │  (github_    │  │  (developer_  │  │
│  │  repos, etc) │  │  metrics_    │  │  summary,    │  │
│  │              │  │  cache)      │  │  mad_cache)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **Service Layer Pattern**: Business logic extracted to `lib/services/*` for reuse across pages and API routes
2. **Cache-First Strategy**: Heavy computations stored in cache tables (`githubMetricsCache`, `developerSummary`, `madCache28d`)
3. **ISR (Incremental Static Regeneration)**: Pages use `revalidate` for performance (15min - 1hr cache)
4. **Idempotent Operations**: All scripts and jobs are idempotent (safe to re-run)

---

## 2. Database Schema & Setup

### Core Tables

**Raw Data Tables:**

- `repository` - GitHub repositories being tracked
- `commit` - Individual commits from repositories
- `contributor` - GitHub contributors
- `developer` - Developer profiles (manual + auto-populated)
- `socialMedia` - Social media analytics (X/Twitter, etc.)
- `xPosts` - X/Twitter posts for content engagement tracking

**Cache/Summary Tables:**

- `githubMetricsCache` - Pre-computed GitHub metrics by period
- `developerSummary` - Aggregated developer stats by time window
- `madCache28d` - Monthly Active Developers (28-day rolling)
- `repoSummary` - Repository-level aggregations
- `apiCache` - General API response cache

**System Tables:**

- `user`, `session`, `account`, `verification` - Better Auth tables
- `aggregateJobLog` - Job execution logs
- `log` - Application logs

### Database Connection

**File**: [`lib/db/index.ts`](lib/db/index.ts)

- Uses `postgres` library with connection pooling
- Connection string from `DATABASE_URL` environment variable
- SSL required for production
- Connection reuse across hot reloads

### Migration System

**Config**: [`drizzle.config.ts`](drizzle.config.ts)
**Migrations**: [`lib/db/migrations/`](lib/db/migrations/)

**Commands:**

```bash
# Generate migration from schema changes
bunx drizzle-kit generate

# Apply migrations to database
bunx drizzle-kit migrate

# View current schema
bunx drizzle-kit studio
```

---

## 3. Environment Variables & Configuration

### Required Environment Variables

**Local Development** (`.env.local`):

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db?pgbouncer=true

# Authentication
AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3006
NEXT_PUBLIC_BASE_URL=http://localhost:3006

# API Security
API_SECRET=your-api-secret-here

# GitHub API (for data fetching)
GITHUB_TOKEN=ghp_your_github_token_here

# Umami Analytics (optional, for web traffic)
UMAMI_BASE_URL=https://umami.example.com
UMAMI_USERNAME=your_username
UMAMI_PASSWORD=your_password
UMAMI_WEBSITE_ID=your_website_id
```

**Production (Vercel):**

- Same variables as above, but with production URLs
- Set via Vercel Dashboard → Settings → Environment Variables

**GitHub Actions Secrets** (for cron jobs):

- `DATABASE_URL`
- `API_SECRET`
- `BETTER_AUTH_URL`

### Environment Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (use pooling URL for serverless) | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `AUTH_SECRET` | Yes | Secret key for Better Auth session encryption | Random 32+ character string |
| `BETTER_AUTH_URL` | Yes | Base URL for authentication (local or production) | `http://localhost:3006` or `https://devdash.kaia.io` |
| `NEXT_PUBLIC_BASE_URL` | Yes | Public base URL for the application | Same as `BETTER_AUTH_URL` |
| `API_SECRET` | Yes | Secret for protecting API endpoints | Random 32+ character string |
| `GITHUB_TOKEN` | Optional | GitHub Personal Access Token for API calls | `ghp_xxxxxxxxxxxx` |
| `UMAMI_BASE_URL` | Optional | Umami Analytics instance URL | `https://umami.example.com` |
| `UMAMI_USERNAME` | Optional | Umami Analytics username | `admin` |
| `UMAMI_PASSWORD` | Optional | Umami Analytics password | `password` |
| `UMAMI_WEBSITE_ID` | Optional | Umami Analytics website ID | `uuid-string` |

### Environment Validation

**File**: [`lib/env.ts`](lib/env.ts)

Uses Zod schema for type-safe environment variable validation.

---

## 4. Data Flow & Component Interconnections

### Request Flow Example: GitHub Metrics Page

```
User Request Flow:
─────────────────────────────────────────────────────────────

1. User → Page Component
   GET /dashboard/github

2. Page Component → Service (github-metrics.ts)
   getGithubMetrics(periodId)

3. Service → Cache (githubMetricsCache)
   Check cache for period
   
   IF Cache Hit:
      Cache → Service: Return cached data
   
   IF Cache Miss:
      Service → Database (commit table)
         Query commits by period
      Database → Service: Raw commit data
      Service: Aggregate metrics
      Service → Cache: Store computed metrics
      Service → Page: Return computed data

4. Service → Page Component
   Metrics data

5. Page Component → User
   Render page with metrics
```

### Data Ingestion Flow

```
Data Ingestion Flow:
─────────────────────────────────────────────────────────────

External Sources                    Scripts
    │                                   │
    ├─ GitHub API ────────────────────┼─→ Import/Transform
    ├─ CSV Files ──────────────────────┤
    └─ Umami API ──────────────────────┘
                                        │
                                        ▼
                                  Raw Tables
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
              repository            commit          socialMedia
                    │                   │                   │
                    └───────────────────┴───────────────────┘
                                        │
                                        ▼
                              Aggregation Jobs
                                        │
                                        ▼
                                  Cache Tables
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
         githubMetricsCache    developerSummary      madCache28d
```

### Component Dependencies

**Pages → Services → Database:**

- Pages (`app/dashboard/*/page.tsx`) import services directly (no internal HTTP calls)
- Services (`lib/services/*.ts`) handle DB queries and caching
- Database accessed via Drizzle ORM (`lib/db/index.ts`)

**API Routes → Services:**

- API routes (`app/api/view/*`, `app/api/data/*`) delegate to services
- Maintains backward compatibility for external API consumers

---

## 5. Scripts Reference

### Data Import Scripts

**Repository Management:**

- `scripts/import-repositories.ts` - Import repositories from CSV/JSON
- `scripts/populateRepositories.ts` - Populate from GitHub API
- `scripts/mark-forks.ts` - Mark repositories as forks

**Commit & Contributor Data:**

- `scripts/getCommits.ts` - Fetch commits from GitHub API
- `scripts/getCommitsWithDateRange.ts` - Fetch commits for date range
- `scripts/getContributors.ts` - Fetch repository contributors
- `scripts/getKlaytnHistoricalCommits.ts` - Import historical Klaytn commits

**Developer Data:**

- `scripts/populateDevelopers.ts` - Populate developer profiles
- `scripts/indexDevelopers.ts` - Index developers from commits
- `scripts/fetch-developer-locations.ts` - Fetch GitHub location data

**Social Media:**

- `scripts/import-bok-analytics.ts` - Import Build on Kaia analytics CSV
- `scripts/populateSocialMedia.ts` - Populate social media metrics

### Aggregation Scripts

**GitHub Metrics:**

- `scripts/compute-github-metrics.ts` - Compute and cache GitHub metrics
- `scripts/compute-github-metrics-standalone.ts` - Standalone version (fresh DB connection)

**Cache Management:**

- `scripts/clear-github-metrics-cache.ts` - Clear GitHub metrics cache

### Utility Scripts

- `scripts/migrate.ts` - Run database migrations
- `scripts/generate-repo-catalog.ts` - Generate repository catalog
- `scripts/backfill-period-commits.ts` - Backfill commits for specific periods

### Script Execution Pattern

All scripts follow this pattern:

1. Load environment variables from `.env.local`
2. Verify `DATABASE_URL` is set
3. Connect to database
4. Perform idempotent operations (upserts, not inserts)
5. Log progress and results

**Example:**

```bash
# Set DATABASE_URL in environment
export DATABASE_URL="postgresql://..."

# Or use .env.local
bun tsx scripts/import-bok-analytics.ts
```

---

## 6. Database Migration Guide

### Option A: Fresh Database Setup

**Step 1: Create Database**

1. Create PostgreSQL database (Supabase recommended)
2. Get connection string: `postgresql://user:pass@host:port/db`

**Step 2: Configure Environment**

```bash
# .env.local
DATABASE_URL=postgresql://user:pass@host:port/db?pgbouncer=true
```

**Step 3: Run Migrations**

```bash
bunx drizzle-kit migrate
```

**Step 4: Verify Schema**

```bash
bunx drizzle-kit studio
# Opens Drizzle Studio to view tables
```

**Step 5: Import Initial Data**

```bash
# Import repositories
bun tsx scripts/import-repositories.ts

# Import historical commits (if needed)
bun tsx scripts/getKlaytnHistoricalCommits.ts
bun tsx scripts/getCommits.ts

# Import social media data
bun tsx scripts/import-bok-analytics.ts

# Populate developers
bun tsx scripts/populateDevelopers.ts
```

**Step 6: Compute Initial Cache**

```bash
# Compute GitHub metrics cache
bun tsx scripts/compute-github-metrics.ts

# Aggregate developer summaries
curl -X POST "http://localhost:3006/api/jobs/aggregate-github?window=all" \
  -H "apiSecret: YOUR_API_SECRET"
```

### Option B: Migrate from Existing Database

**Step 1: Export Data from Source Database**

**Export Raw Data:**

```bash
# Export repositories
pg_dump $SOURCE_DATABASE_URL -t repository --data-only --column-inserts > repos.sql

# Export commits
pg_dump $SOURCE_DATABASE_URL -t commit --data-only --column-inserts > commits.sql

# Export developers
pg_dump $SOURCE_DATABASE_URL -t developer --data-only --column-inserts > developers.sql

# Export social media
pg_dump $SOURCE_DATABASE_URL -t social_media --data-only --column-inserts > social_media.sql

# Export x_posts
pg_dump $SOURCE_DATABASE_URL -t x_posts --data-only --column-inserts > x_posts.sql
```

**Export Cache Tables (optional, can be recomputed):**

```bash
pg_dump $SOURCE_DATABASE_URL -t github_metrics_cache --data-only --column-inserts > cache_github.sql
pg_dump $SOURCE_DATABASE_URL -t developer_summary --data-only --column-inserts > cache_dev.sql
pg_dump $SOURCE_DATABASE_URL -t mad_cache_28d --data-only --column-inserts > cache_mad.sql
```

**Step 2: Create Target Database**

1. Create new PostgreSQL database
2. Get connection string

**Step 3: Apply Schema Migrations**

```bash
# Set target DATABASE_URL
export DATABASE_URL=$TARGET_DATABASE_URL

# Run migrations to create schema
bunx drizzle-kit migrate
```

**Step 4: Import Data**

```bash
# Import raw data
psql $TARGET_DATABASE_URL < repos.sql
psql $TARGET_DATABASE_URL < commits.sql
psql $TARGET_DATABASE_URL < developers.sql
psql $TARGET_DATABASE_URL < social_media.sql
psql $TARGET_DATABASE_URL < x_posts.sql

# Import cache (optional)
psql $TARGET_DATABASE_URL < cache_github.sql
psql $TARGET_DATABASE_URL < cache_dev.sql
psql $TARGET_DATABASE_URL < cache_mad.sql
```

**Step 5: Verify Data Integrity**

```sql
-- Check row counts
SELECT 'repository' as table_name, COUNT(*) FROM repository
UNION ALL
SELECT 'commit', COUNT(*) FROM commit
UNION ALL
SELECT 'developer', COUNT(*) FROM developer
UNION ALL
SELECT 'social_media', COUNT(*) FROM social_media;

-- Check date ranges
SELECT MIN(timestamp) as earliest_commit, MAX(timestamp) as latest_commit FROM commit;
```

**Step 6: Recompute Cache (Recommended)**

```bash
# Recompute all caches to ensure consistency
bun tsx scripts/compute-github-metrics.ts

curl -X POST "$TARGET_BASE_URL/api/jobs/aggregate-github?window=all" \
  -H "apiSecret: YOUR_API_SECRET"
```

**Step 7: Update Application Configuration**

1. Update `DATABASE_URL` in Vercel environment variables
2. Update GitHub Actions secrets with new `DATABASE_URL`
3. Test application endpoints

### Migration Checklist

- [ ] Source database backup created
- [ ] Target database created
- [ ] Schema migrations applied
- [ ] Raw data exported
- [ ] Raw data imported
- [ ] Data integrity verified
- [ ] Cache tables recomputed
- [ ] Application tested with new database
- [ ] Environment variables updated
- [ ] GitHub Actions secrets updated

---

## 7. Deployment & Infrastructure

### Vercel Deployment

**Setup:**

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `bun run build`
   - Output Directory: `.next`
3. Set environment variables (see Section 3)

**Production URL:**

- Configured in `lib/auth.ts` → `trustedOrigins`
- Update if domain changes

### Database (Supabase)

**Connection:**

- Use connection pooling URL (port 6543) for serverless
- Format: `postgresql://user:pass@host:6543/db?pgbouncer=true`

**Backups:**

- Supabase handles automatic backups
- Manual backup: Export via Supabase dashboard

---

## 8. Automated Jobs & Cron

### GitHub Actions Cron

**Workflow**: [`.github/workflows/github-metrics-cron.yml`](.github/workflows/github-metrics-cron.yml)

**Schedule:** Daily at 2 AM UTC

**What it does:**

1. Runs `scripts/compute-github-metrics.ts` → Updates `githubMetricsCache`
2. Calls `/api/jobs/aggregate-github?window=all` → Updates `developerSummary` and `madCache28d`

**Setup:**

1. Add GitHub Secrets:
   - `DATABASE_URL`
   - `API_SECRET`
   - `BETTER_AUTH_URL`
2. Commit workflow file (already in repo)
3. Verify first run in GitHub Actions tab

**Manual Trigger:**

- GitHub Actions UI → "Run workflow" button

### API Job Endpoints

**`/api/jobs/aggregate-github`**:

- Aggregates developer summaries and MAD cache
- Requires `API_SECRET` header
- Idempotent (safe to re-run)

**`/api/jobs/fetch-x-posts`**:

- Processes X/Twitter CSV and uploads posts
- Requires `API_SECRET` or `CRON_SECRET` header

**`/api/jobs/refresh-cache`**:

- General cache refresh endpoint

---

## 9. Troubleshooting & Operations

### Common Issues

**Database Connection Errors:**

- **Symptom**: `ECONNREFUSED` or `Connection timeout`
- **Solution**: 
  - Verify `DATABASE_URL` is set correctly
  - Check SSL requirements (production requires SSL)
  - Verify connection pooling URL format (port 6543 for Supabase)
  - Test connection: `psql $DATABASE_URL`

**Cache Stale Data:**

- **Symptom**: Dashboard shows outdated metrics
- **Solution**:
```bash
# Clear and recompute GitHub cache
bun tsx scripts/clear-github-metrics-cache.ts
bun tsx scripts/compute-github-metrics.ts

# Re-aggregate developer summaries
curl -X POST "$BASE_URL/api/jobs/aggregate-github?window=all" \
  -H "apiSecret: $API_SECRET"
```

**GitHub API Rate Limits:**

- **Symptom**: `API rate limit exceeded` errors
- **Solution**:
  - Scripts include delays to respect rate limits
  - Use `GITHUB_TOKEN` for higher limits (5000 requests/hour)
  - Monitor rate limit headers in responses
  - Wait for rate limit reset (usually 1 hour)

**Build Errors:**

- **Symptom**: Build fails with TypeScript or ESLint errors
- **Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
bun install

# Rebuild
bun run build
```

**Authentication Issues:**

- **Symptom**: Users cannot sign in or sessions expire
- **Solution**:
  - Verify `AUTH_SECRET` is set and consistent across environments
  - Check `BETTER_AUTH_URL` matches the actual deployment URL
  - Verify `trustedOrigins` in `lib/auth.ts` includes production URL
  - Clear browser cookies and try again

**Page Load Timeouts:**

- **Symptom**: Pages timeout after 60 seconds
- **Solution**:
  - Verify cache tables are populated (`githubMetricsCache`, `developerSummary`)
  - Check server logs for cache hits/misses
  - Run aggregation scripts to populate cache
  - Consider increasing `revalidate` time for less frequent updates

**Migration Errors:**

- **Symptom**: `drizzle-kit migrate` fails
- **Solution**:
  - Check database connection
  - Verify schema changes are valid
  - Review migration files in `lib/db/migrations/`
  - Rollback if needed: Restore from backup

### Monitoring

**Job Logs:**

- Check `aggregateJobLog` table for job execution history:
```sql
SELECT * FROM aggregate_job_log 
ORDER BY started_at DESC 
LIMIT 10;
```
- GitHub Actions logs for cron job runs (GitHub → Actions tab)

**Application Logs:**

- Vercel function logs (Dashboard → Functions)
- Check `log` table in database:
```sql
SELECT * FROM log 
ORDER BY created_at DESC 
LIMIT 50;
```

**Performance:**

- Monitor page load times in Vercel Analytics
- Check database query performance in Supabase dashboard
- Review slow queries:
```sql
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

**Health Checks:**

- Database: `/api/health/db`
- Environment: `/api/health/env`
- General: `/api/health`

---

## 10. Development Workflow

### Local Development

**Start Dev Server:**

```bash
bun dev
# Runs on http://localhost:3006
```

**Run Scripts:**

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Or use .env.local
bun tsx scripts/script-name.ts
```

**Database Migrations:**

```bash
# After schema changes
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

### Code Structure

**Key Directories:**

- `app/` - Next.js app router (pages, API routes)
- `lib/` - Shared utilities, services, database
- `components/` - React components
- `scripts/` - Data import/processing scripts
- `docs/` - Documentation

**Service Layer Pattern:**

- Business logic in `lib/services/*.ts`
- Pages and API routes import services directly
- No internal HTTP calls between components

### Testing Checklist

Before deploying:

- [ ] All pages load without errors
- [ ] API endpoints return expected data
- [ ] Database queries execute successfully
- [ ] Cron jobs run without errors
- [ ] Environment variables are set correctly
- [ ] Build completes without errors

---

## Additional Resources

- **Technical Stack**: [`docs/technical-stack.md`](docs/technical-stack.md)
- **GitHub Actions Setup**: [`docs/github-actions-cron-setup.md`](docs/github-actions-cron-setup.md)
- **X Posts Workflow**: [`docs/x-posts-workflow.md`](docs/x-posts-workflow.md)
- **Klaytn Import**: [`scripts/README-KLAYTN-IMPORT.md`](scripts/README-KLAYTN-IMPORT.md)
- **GitHub Metrics Cache**: [`scripts/README-GITHUB-METRICS-CACHE.md`](scripts/README-GITHUB-METRICS-CACHE.md)

---