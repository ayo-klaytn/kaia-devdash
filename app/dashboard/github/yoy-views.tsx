"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullYearData {
  year: number;
  distinctAuthors: number;
  yoyPercent: number | null;
}

interface KaiaEraData {
  period: string;
  distinctAuthors: number;
  start: string;
  end: string;
}

export function FullYearYoYTable() {
  const [data, setData] = useState<FullYearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch("/api/view/github-yoy-analysis?view=full-year", {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        console.error("Error fetching full-year data:", err);
        if (err instanceof Error && err.name === 'AbortError') {
          setError("Request timed out. The query is taking longer than expected. Please try again.");
        } else {
          setError(`Failed to load full-year data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
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
          <CardTitle>Full-Year Year-over-Year</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Full-Year Year-over-Year</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Full-Year MAD Year-over-Year</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sum of Monthly Active Developers (MAD) per year (2022, 2023, 2024 if complete)
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Year</th>
                <th className="p-3 text-right font-semibold">Distinct Authors</th>
                <th className="p-3 text-right font-semibold">YoY Change</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.year} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right">{row.distinctAuthors.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    {row.yoyPercent !== null ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-medium",
                          row.yoyPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {row.yoyPercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {row.yoyPercent > 0 ? "+" : ""}
                        {row.yoyPercent.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function KaiaEraStrategicView() {
  const [data, setData] = useState<KaiaEraData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<'monthly' | 'quarterly'>('quarterly'); // Default to quarterly (faster, fewer queries)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout - API has maxDuration=60s, this gives buffer
        
        const response = await fetch(`/api/view/github-yoy-analysis?view=kaia-era&granularity=${granularity}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        
        if (!result || !result.data) {
          throw new Error('Invalid response format from API');
        }
        
        setData(result.data || []);
      } catch (err) {
        console.error("Error fetching Kaia Era data:", err);
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError("Request timed out. The query may be taking too long. Please try again.");
          } else {
            setError(`Failed to load Kaia Era data: ${err.message}`);
          }
        } else {
          setError("Failed to load Kaia Era data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [granularity]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kaia Era Strategic View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading {granularity} data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kaia Era Strategic View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kaia Era Strategic View (MAD)</CardTitle>
        <p className="text-sm text-muted-foreground">
          {granularity === 'monthly' ? 'Monthly' : 'Quarterly'} sums of Monthly Active Developers from Sept 1, 2024 onward
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setGranularity('monthly')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
              granularity === 'monthly'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:bg-muted"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setGranularity('quarterly')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
              granularity === 'quarterly'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:bg-muted"
            )}
          >
            Quarterly
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Period</th>
                <th className="p-3 text-right font-semibold">Distinct Authors</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={`${row.start}-${row.end}`} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{row.period}</td>
                  <td className="p-3 text-right">{row.distinctAuthors.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

