import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { headers } from 'next/headers';
import { eq, sql } from "drizzle-orm";
import { developerSummary, repoSummary, madCache28d, aggregateJobLog } from "@/lib/db/schema";
import { createId } from '@paralleldrive/cuid2';

export const runtime = 'nodejs'


export async function POST(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');
  if (process.env.API_SECRET) {
    if (!apiSecret || apiSecret !== process.env.API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(request.url);
  const window = url.searchParams.get('window') || 'all'; // '28d' | '90d' | '365d' | 'september-2025' | 'all'

  const jobId = createId();
  const startedAt = new Date();
  await db.insert(aggregateJobLog).values({
    id: jobId,
    jobName: 'aggregate-github',
    status: 'running',
    message: 'started',
    startedAt,
    finishedAt: startedAt,
  });

  try {
    const now = new Date();
    const from28 = new Date(now);
    from28.setUTCDate(now.getUTCDate() - 28);
    const from90 = new Date(now);
    from90.setUTCDate(now.getUTCDate() - 90);
    const from365 = new Date(now);
    from365.setUTCDate(now.getUTCDate() - 365);

    // Load commits window(s)
    const windows: Array<{ key: string; from: Date; to: Date }> = [];
    if (window === '28d' || window === 'all') windows.push({ key: '28d', from: from28, to: now });
    if (window === '90d' || window === 'all') windows.push({ key: '90d', from: from90, to: now });
    if (window === '365d' || window === 'all') windows.push({ key: '365d', from: from365, to: now });
    if (window === 'september-2025' || window === 'all') {
      const septemberStart = new Date('2025-09-01T00:00:00Z');
      const septemberEnd = new Date('2025-09-30T23:59:59Z');
      windows.push({ key: 'september-2025', from: septemberStart, to: septemberEnd });
    }

    for (const w of windows) {
      // Developer summaries by email
      const rows = await db.execute(sql`
        SELECT
          c.committer_email as email,
          MAX(c.committer_name) as display_name,
          COUNT(*)::int as commit_count,
          COUNT(DISTINCT c.repository_id)::int as repo_count,
          MIN(c.timestamp) as first_commit_at,
          MAX(c.timestamp) as last_commit_at
        FROM "commit" c
        WHERE c.timestamp >= ${w.from.toISOString()} AND c.timestamp <= ${now.toISOString()}
        GROUP BY c.committer_email
      `);

      const upserts = (rows as Array<Record<string, unknown>>).map((r) => ({
        id: createId(),
        window: w.key,
        email: (r.email as string) || null,
        displayName: (r.display_name as string) || null,
        commitCount: Number(r.commit_count || 0),
        repoCount: Number(r.repo_count || 0),
        firstCommitAt: r.first_commit_at ? new Date(String(r.first_commit_at)) : null,
        lastCommitAt: r.last_commit_at ? new Date(String(r.last_commit_at)) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      if (upserts.length > 0) {
        // Clear old window
        await db.delete(developerSummary).where(eq(developerSummary.window, w.key));
        await db.insert(developerSummary).values(upserts);
      }

      // Repo summaries
      const repoRows = await db.execute(sql`
        SELECT
          c.repository_id as repository_id,
          MAX(r.owner || '/' || r.name) as full_name,
          COUNT(*)::int as commit_count,
          COUNT(DISTINCT c.committer_email)::int as developer_count,
          MAX(c.timestamp) as last_commit_at
        FROM "commit" c
        JOIN repository r ON r.id = c.repository_id
        WHERE c.timestamp >= ${w.from.toISOString()} AND c.timestamp <= ${now.toISOString()}
        GROUP BY c.repository_id
      `);

      const repoUpserts = (repoRows as Array<Record<string, unknown>>).map((r) => ({
        id: createId(),
        window: w.key,
        repositoryId: String(r.repository_id),
        fullName: (r.full_name as string) || null,
        commitCount: Number(r.commit_count || 0),
        developerCount: Number(r.developer_count || 0),
        lastCommitAt: r.last_commit_at ? new Date(String(r.last_commit_at)) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      if (repoUpserts.length > 0) {
        await db.delete(repoSummary).where(eq(repoSummary.window, w.key));
        await db.insert(repoSummary).values(repoUpserts);
      }

      // MAD cache by day (28d only)
      if (w.key === '28d') {
        const madRows = await db.execute(sql`
          SELECT
            to_char(date_trunc('day', c.timestamp::timestamp at time zone 'UTC'), 'YYYY-MM-DD') as day,
            COUNT(DISTINCT c.committer_email)::int as unique_developer_count
          FROM "commit" c
          WHERE c.timestamp >= ${from28.toISOString()} AND c.timestamp <= ${now.toISOString()}
          GROUP BY day
          ORDER BY day
        `);
        const madUpserts = (madRows as Array<Record<string, unknown>>).map((r) => ({
          date: String(r.day),
          uniqueDeveloperCount: Number(r.unique_developer_count || 0),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        if (madUpserts.length > 0) {
          await db.delete(madCache28d);
          await db.insert(madCache28d).values(madUpserts);
        }
      }
    }

    const finishedAt = new Date();
    await db.update(aggregateJobLog)
      .set({ status: 'success', message: 'completed', finishedAt })
      .where(eq(aggregateJobLog.id, jobId));
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const finishedAt = new Date();
    await db.update(aggregateJobLog)
      .set({ status: 'error', message: e instanceof Error ? e.message : String(e), finishedAt })
      .where(eq(aggregateJobLog.id, jobId));
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

