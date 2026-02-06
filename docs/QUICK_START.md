# DevRel Dashboard - Quick Start Guide

This guide helps you get the DevRel Dashboard up and running quickly. For comprehensive details, see [HANDOVER.md](./HANDOVER.md).

## Prerequisites

- Node.js 20+ or Bun installed
- PostgreSQL database (Supabase recommended)
- GitHub Personal Access Token (optional, for data fetching)
- Access to Vercel (for deployment)

## 5-Minute Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd kaia-devdash
bun install
```

### 2. Configure Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host:port/db?pgbouncer=true
AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3006
NEXT_PUBLIC_BASE_URL=http://localhost:3006
API_SECRET=your-api-secret-here
GITHUB_TOKEN=ghp_your_token_here  # Optional
```

### 3. Setup Database

```bash
# Run migrations
bunx drizzle-kit migrate

# Verify schema
bunx drizzle-kit studio
```

### 4. Start Development Server

```bash
bun dev
```

Visit `http://localhost:3006` and sign up for an account.

## Initial Data Import

### Option A: Fresh Start (Empty Database)

```bash
# Import repositories
bun tsx scripts/import-repositories.ts

# Import commits (if you have GitHub token)
bun tsx scripts/getCommits.ts

# Import social media data
bun tsx scripts/import-bok-analytics.ts

# Populate developers
bun tsx scripts/populateDevelopers.ts

# Compute initial cache
bun tsx scripts/compute-github-metrics.ts
```

### Option B: Migrate from Existing Database

```bash
# 1. Export from source
DATABASE_URL=source_db_url bun tsx scripts/migrate-export-data.ts

# 2. Import to target
DATABASE_URL=target_db_url bun tsx scripts/migrate-import-data.ts

# 3. Recompute cache
bun tsx scripts/compute-github-metrics.ts
```

## Verify Setup

1. **Check Database Connection:**
   ```bash
   curl http://localhost:3006/api/health/db
   ```

2. **Check Pages Load:**
   - `/dashboard` - Main dashboard
   - `/dashboard/github` - GitHub metrics
   - `/dashboard/developers` - Developer metrics
   - `/dashboard/x` - X/Twitter analytics

3. **Check Cache:**
   ```sql
   SELECT COUNT(*) FROM github_metrics_cache;
   SELECT COUNT(*) FROM developer_summary;
   ```

## Production Deployment

### 1. Deploy to Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel Dashboard
3. Deploy

### 2. Setup Cron Jobs

1. Add GitHub Secrets:
   - `DATABASE_URL`
   - `API_SECRET`
   - `BETTER_AUTH_URL`

2. Verify workflow runs:
   - GitHub → Actions → "GitHub Metrics Cron"

## Common Commands

```bash
# Development
bun dev                    # Start dev server
bun run build             # Build for production
bun run lint              # Run linter

# Database
bunx drizzle-kit generate # Generate migration
bunx drizzle-kit migrate # Apply migrations
bunx drizzle-kit studio   # Open DB studio

# Scripts
bun tsx scripts/compute-github-metrics.ts  # Compute cache
bun tsx scripts/import-bok-analytics.ts    # Import CSV data
```

## Troubleshooting

**Database connection fails?**
- Verify `DATABASE_URL` is correct
- Check SSL requirements (production needs SSL)
- Use connection pooling URL (port 6543 for Supabase)

**Pages timeout?**
- Run `bun tsx scripts/compute-github-metrics.ts` to populate cache
- Check cache tables have data

**Build errors?**
```bash
rm -rf .next node_modules
bun install
bun run build
```

## Next Steps

- Read [HANDOVER.md](./HANDOVER.md) for comprehensive documentation
- Review [technical-stack.md](./technical-stack.md) for tech details
- Check [github-actions-cron-setup.md](./github-actions-cron-setup.md) for automation

## Getting Help

- Check logs: Vercel Dashboard → Functions
- Database logs: Supabase Dashboard
- Job logs: `SELECT * FROM aggregate_job_log ORDER BY started_at DESC LIMIT 10;`

---

**Need more details?** See [HANDOVER.md](./HANDOVER.md) for the complete guide.
