import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { repository, log } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq, asc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get("apiSecret");

  if (!apiSecret) {
    return NextResponse.json(
      { error: "No API secret provided" },
      { status: 401 }
    );
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "100";
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const repositories = await db
    .select()
    .from(repository)
    .orderBy(asc(repository.owner))
    .limit(parseInt(limit))
    .offset(offset);

  const updatedRepositories = [];

  for (const repo of repositories) {
    if (!repo.url) {
      const newUrl = `https://github.com/${repo.owner}/${repo.name}`;
      await db
        .update(repository)
        .set({ url: newUrl })
        .where(eq(repository.id, repo.id));
    }

    const url = repo.url || `https://github.com/${repo.owner}/${repo.name}`;

    try {
      const response = await fetch(url);
      // wait for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (response.status === 200) {
        await db
          .update(repository)
          .set({ status: "active" })
          .where(eq(repository.id, repo.id));
      } else {
        await db
          .update(repository)
          .set({ status: "inactive" })
          .where(eq(repository.id, repo.id));
      }
    } catch (error) {
      await db.insert(log).values({
        id: createId(),
        logCode: "4020",
        message: `Error checking status of repository ${repo.id}: ${error}`,
        rawData: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
    updatedRepositories.push(repo);
  }

  return NextResponse.json(
    {
      message: "Repositories status checked",
      updatedRepositories: updatedRepositories,
      totalRepositories: repositories.length,
    },
    { status: 200 }
  );
}
