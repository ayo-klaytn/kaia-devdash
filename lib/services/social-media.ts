import { asc, eq } from "drizzle-orm";

import db from "@/lib/db";
import { socialMedia } from "@/lib/db/schema";

export async function getKaiaDevInternData(limit = 365) {
  return db
    .select()
    .from(socialMedia)
    .where(eq(socialMedia.name, "kaiadevintern"))
    .orderBy(asc(socialMedia.date))
    .limit(limit);
}

export type BokMonthlyPoint = {
  month: string;
  impressions: number;
  engagementRate: number;
  newFollowers: number;
};

export async function getBokAnalyticsSeries(): Promise<BokMonthlyPoint[]> {
  const rows = await db
    .select()
    .from(socialMedia)
    .where(eq(socialMedia.name, "buildonkaia"))
    .orderBy(asc(socialMedia.date));

  const daily = rows
    .map((row) => {
      const rawDate = row.date ?? "";
      let d = new Date(rawDate as string | number | Date);
      if (isNaN(d.getTime())) {
        const asNumber = Number(rawDate);
        if (!isNaN(asNumber)) {
          d = new Date(asNumber);
        }
      }
      if (isNaN(d.getTime())) {
        return null;
      }
      return {
        date: d,
        impressions: row.impressions || 0,
        engagements: row.engagements || 0,
        newFollows: row.newFollows || 0,
      };
    })
    .filter(
      (d): d is { date: Date; impressions: number; engagements: number; newFollows: number } =>
        d !== null,
    );

  const monthly = daily.reduce(
    (acc: Record<string, { impressions: number; engagements: number; newFollows: number }>, d) => {
      const key = d.date.toISOString().slice(0, 7);
      if (!acc[key]) {
        acc[key] = { impressions: 0, engagements: 0, newFollows: 0 };
      }
      acc[key].impressions += d.impressions;
      acc[key].engagements += d.engagements;
      acc[key].newFollows += d.newFollows;
      return acc;
    },
    {} as Record<string, { impressions: number; engagements: number; newFollows: number }>,
  );

  const monthlySeries: BokMonthlyPoint[] = Object.entries(monthly)
    .sort(([a], [b]) => new Date(a + "-01").getTime() - new Date(b + "-01").getTime())
    .map(([monthKey, m]) => {
      const label = new Date(monthKey + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const engagementRate = m.impressions > 0 ? Number(((m.engagements / m.impressions) * 100).toFixed(2)) : 0;
      return {
        month: label,
        impressions: m.impressions,
        engagementRate,
        newFollowers: m.newFollows,
      };
    });

  return monthlySeries;
}

