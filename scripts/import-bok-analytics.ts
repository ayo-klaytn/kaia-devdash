import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

import db from "@/lib/db";
import { socialMedia } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const SOURCE_NAME = "buildonkaia";

const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word, index) => (index === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join("");
};

interface BokAnalyticsRow {
  date: string;
  impressions: string;
  likes: string;
  engagements: string;
  bookmarks: string;
  shares: string;
  newfollows: string;
  unfollows: string;
  replies: string;
  reposts: string;
  profilevisits: string;
  createpost: string;
  videoviews: string;
  mediaviews: string;
}

async function parseCsv(filePath: string) {
  const csvFile = await fs.readFile(filePath, "utf8");

  const result = Papa.parse<BokAnalyticsRow>(csvFile.toString(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => toCamelCase(header),
  });

  if (result.errors.length) {
    console.warn("[import-bok-analytics] CSV parse warnings:", result.errors.slice(0, 5));
  }

  return result.data;
}

function normalizeDateKey(raw: string): string | null {
  const trimmed = raw.replace(/^"|"$/g, "").trim();
  if (!trimmed) return null;

  let d = new Date(trimmed);
  if (isNaN(d.getTime())) {
    // Try without weekday prefix: "Thu, Sep 11, 2025" -> "Sep 11, 2025"
    const withoutDay = trimmed.replace(/^[^,]+,?\s*/, "");
    d = new Date(withoutDay);
  }
  if (isNaN(d.getTime())) return null;

  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function importBokAnalytics() {
  const csvPath = path.join(process.cwd(), "lib", "mocks", "bok-analytics.csv");
  console.log(`[import-bok-analytics] Reading CSV from ${csvPath}`);

  const rows = await parseCsv(csvPath);
  console.log(`[import-bok-analytics] Parsed ${rows.length} rows from CSV`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      if (!row.date) {
        skipped++;
        continue;
      }

      const dateKey = normalizeDateKey(row.date);
      if (!dateKey) {
        console.warn(`[import-bok-analytics] Skipping row with invalid date: ${row.date}`);
        skipped++;
        continue;
      }

      const impressions = parseInt(row.impressions || "0", 10) || 0;
      const likes = parseInt(row.likes || "0", 10) || 0;
      const engagements = parseInt(row.engagements || "0", 10) || 0;
      const bookmarks = parseInt(row.bookmarks || "0", 10) || 0;
      const shares = parseInt(row.shares || "0", 10) || 0;
      const newFollows = parseInt(row.newfollows || "0", 10) || 0;
      const unfollows = parseInt(row.unfollows || "0", 10) || 0;
      const replies = parseInt(row.replies || "0", 10) || 0;
      const reposts = parseInt(row.reposts || "0", 10) || 0;
      const profileVisits = parseInt(row.profilevisits || "0", 10) || 0;
      const createPost = parseInt(row.createpost || "0", 10) || 0;
      const videoViews = parseInt(row.videoviews || "0", 10) || 0;
      const mediaViews = parseInt(row.mediaviews || "0", 10) || 0;

      const existing = await db
        .select()
        .from(socialMedia)
        .where(and(eq(socialMedia.name, SOURCE_NAME), eq(socialMedia.date, dateKey)))
        .limit(1);

      const now = new Date();

      if (existing.length > 0) {
        await db
          .update(socialMedia)
          .set({
            impressions,
            likes,
            engagements,
            bookmarks,
            shares,
            newFollows,
            unfollows,
            replies,
            reposts,
            profileVisits,
            createPost,
            videoViews,
            mediaViews,
            updatedAt: now,
          })
          .where(eq(socialMedia.id, existing[0].id));
        updated++;
      } else {
        await db.insert(socialMedia).values({
          id: `bok:${dateKey}`,
          name: SOURCE_NAME,
          date: dateKey,
          impressions,
          likes,
          engagements,
          bookmarks,
          shares,
          newFollows,
          unfollows,
          replies,
          reposts,
          profileVisits,
          createPost,
          videoViews,
          mediaViews,
          createdAt: now,
          updatedAt: now,
        });
        inserted++;
      }
    } catch (error) {
      console.error("[import-bok-analytics] Error processing row:", error);
      skipped++;
    }
  }

  console.log(
    `[import-bok-analytics] Done. inserted=${inserted}, updated=${updated}, skipped=${skipped}, total=${rows.length}`,
  );
}

importBokAnalytics()
  .then(() => {
    console.log("[import-bok-analytics] Finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[import-bok-analytics] Failed:", err);
    process.exit(1);
  });

