"use client";

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MadProgressData {
  month: string;
  count: number;
  year: number;
  monthNumber: number;
}

interface MadProgressChartProps {
  data: MadProgressData[];
  uniqueDevelopersAcrossPeriod: number;
  totalDeveloperMonths: number;
}

export function MadProgressChart({ data, uniqueDevelopersAcrossPeriod: _uniqueDevelopersAcrossPeriod, totalDeveloperMonths }: MadProgressChartProps) {
  // uniqueDevelopersAcrossPeriod is kept for API compatibility but not used in this component
  void _uniqueDevelopersAcrossPeriod;
  const sortedData = useMemo(
    () =>
      [...data].sort((a, b) =>
        a.year === b.year ? a.monthNumber - b.monthNumber : a.year - b.year,
      ),
    [data],
  );

  const metrics = useMemo(() => {
    if (sortedData.length === 0) {
      const defaultMonths = [
        "Jan 2025",
        "Feb 2025",
        "Mar 2025",
        "Apr 2025",
        "May 2025",
        "Jun 2025",
        "Jul 2025",
        "Aug 2025",
        "Sep 2025",
        "Oct 2025",
      ];
      return {
        averagePerMonth: 0,
        growthPercentage: 0,
        peakMonth: { month: defaultMonths[0], count: 0 },
        lowestMonth: { month: defaultMonths[0], count: 0 },
        startMonth: defaultMonths[0],
        endMonth: defaultMonths[defaultMonths.length - 1],
      };
    }

    const averagePerMonth =
      sortedData.length > 0
        ? Math.round(totalDeveloperMonths / sortedData.length)
        : 0;

    const firstMonthCount = sortedData[0]?.count ?? 0;
    const lastMonthCount = sortedData[sortedData.length - 1]?.count ?? 0;
    const growthPercentage =
      firstMonthCount > 0
        ? Math.round(((lastMonthCount - firstMonthCount) / firstMonthCount) * 100)
        : 0;

    const peakMonth = sortedData.reduce(
      (max, item) => (item.count > max.count ? item : max),
      sortedData[0],
    );
    const lowestMonth = sortedData.reduce(
      (min, item) => (item.count < min.count ? item : min),
      sortedData[0],
    );

    return {
      averagePerMonth,
      growthPercentage,
      peakMonth,
      lowestMonth,
      startMonth: sortedData[0]?.month ?? "N/A",
      endMonth: sortedData[sortedData.length - 1]?.month ?? "N/A",
    };
  }, [sortedData, totalDeveloperMonths]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Active Developers Progress</CardTitle>
        <CardDescription>
          Tracking developer engagement from {metrics.startMonth} to {metrics.endMonth}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalDeveloperMonths}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Active Dev
            </div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{metrics.averagePerMonth}</div>
            <div className="text-sm text-muted-foreground">Average per Month</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className={`text-2xl font-bold ${metrics.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.growthPercentage >= 0 ? '+' : ''}{metrics.growthPercentage}%
            </div>
            <div className="text-sm text-muted-foreground">Growth Rate</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Active Developers', angle: -90, position: 'insideLeft' }}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Active Developers']}
                labelFormatter={(label: string) => `Month: ${label}`}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Active Developers"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Key Insights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Peak month: <strong>{metrics.peakMonth.month}</strong> with {metrics.peakMonth.count} developers</li>
            <li>• Lowest month: <strong>{metrics.lowestMonth.month}</strong> with {metrics.lowestMonth.count} developers</li>
            <li>
              • <strong>{totalDeveloperMonths}</strong> total active developers across Jan–Oct 2025 (sum of monthly counts)
            </li>
            <li>
              • {metrics.growthPercentage >= 0 ? 'Growing' : 'Declining'} monthly engagement across the period
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
