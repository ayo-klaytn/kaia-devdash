"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const PACKAGES = [
  "@kaiachain/ethers-ext",
  "@kaiachain/viem-ext",
  "@kaiachain/web3js-ext",
  "@kaiachain/kaia-agent-kit",
];

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00Z");
  return date.toISOString().slice(0, 10);
}

function getDefaultRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth(), end.getUTCDate()));
  return { start: formatDate(start.toISOString().slice(0, 10)), end: formatDate(end.toISOString().slice(0, 10)) };
}

function colorForIndex(i: number) {
  const palette = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  return palette[i % palette.length];
}

export default function ToolAdoptionPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tool Adoption</h1>
        <p className="text-muted-foreground">
          Track SDK downloads and tool adoption metrics
        </p>
      </div>
      <WeeklyDownloadsChart />
    </div>
  );
}

function WeeklyDownloadsChart() {
  const [{ start, end }] = React.useState(getDefaultRange());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [series, setSeries] = React.useState<{
    keys: string[];
    data: Array<Record<string, number | string>>;
  }>({ keys: [], data: [] });

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          packages: PACKAGES.join(","),
          start,
          end,
          granularity: "weekly",
          weekStart: "monday",
        });
        const res = await fetch(`/api/data/tool-adoption?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        // Normalize to a unified x-axis of weekStart dates
        const allWeeks = new Set<string>();
        for (const item of json.data) {
          for (const p of item.series) allWeeks.add(p.weekStart);
        }
        const weeks = Array.from(allWeeks).sort();
        const rows: Array<Record<string, number | string>> = weeks.map((w) => ({ weekStart: w }));
        const keyNames: string[] = [];
        json.data.forEach((pkg: { package: string; series: { weekStart: string; downloads: number }[] }) => {
          const key = pkg.package;
          keyNames.push(key);
          const map = new Map(pkg.series.map((p) => [p.weekStart, p.downloads]));
          rows.forEach((r) => {
            r[key] = map.get(r.weekStart as string) ?? 0;
          });
        });
        if (!cancelled) setSeries({ keys: keyNames, data: rows });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load downloads";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [start, end]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly npm Downloads</CardTitle>
        <CardDescription>
          Aggregated weekly downloads (UTC week start: Monday) for Kaia SDK packages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Loading…</div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-red-600 text-sm">{error}</div>
          ) : (
            <ChartContainer
              config={Object.fromEntries(
                series.keys.map((k, i) => [k, { label: k, color: colorForIndex(i) }])
              )}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series.data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekStart" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {series.keys.map((k, i) => (
                    <Line key={k} type="monotone" dataKey={k} stroke={colorForIndex(i)} dot={false} strokeWidth={2} />
                  ))}
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

