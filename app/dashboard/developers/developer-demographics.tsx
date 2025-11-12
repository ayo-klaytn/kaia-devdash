"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DeveloperDemographicsData {
  totalContributors: number;
  contributorsWithLocation: number;
  countryBreakdown: Array<{
    country: string;
    developerCount: number;
    totalCommits: number;
    topDevelopers: Array<{ name: string; commitCount: number }>;
  }>;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--muted-foreground))",
];

export function DeveloperDemographics() {
  const [data, setData] = useState<DeveloperDemographicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/view/developer-demographics?limit=100&days=365");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result: DeveloperDemographicsData = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching developer demographics:", err);
        setError("Failed to load demographics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Developer Demographics</CardTitle>
        </CardHeader>
        <CardContent>Loading demographics data...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Developer Demographics</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (!data || data.countryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Developer Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No location data available. Run the location enrichment script to populate this data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.countryBreakdown.map((item) => ({
    country: item.country,
    developers: item.developerCount,
    commits: item.totalCommits,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Developer Demographics (Top 100 Contributors)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Geographic distribution of top contributors by commit count (last 365 days)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.contributorsWithLocation} of {data.totalContributors} contributors have location data
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="country"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof chartData[0];
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                        <p className="font-bold mb-1">{data.country}</p>
                        <p>Developers: {data.developers}</p>
                        <p>Total Commits: {data.commits.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="developers" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

