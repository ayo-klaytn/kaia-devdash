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

export function MadProgressChart({ data, uniqueDevelopersAcrossPeriod, totalDeveloperMonths }: MadProgressChartProps) {
  // Memoize calculations to prevent unnecessary re-renders
  const metrics = useMemo(() => {
    const averagePerMonth = data.length > 0 ? Math.round(totalDeveloperMonths / data.length) : 0;
    
    // Calculate growth from first to last month
    const firstMonth = data[0]?.count || 0;
    const lastMonth = data[data.length - 1]?.count || 0;
    const growthPercentage = firstMonth > 0 ? Math.round(((lastMonth - firstMonth) / firstMonth) * 100) : 0;
    
    // Find peak and lowest months
    const peakMonth = data.reduce((max, item) => item.count > max.count ? item : max, data[0] || { month: 'N/A', count: 0 });
    const lowestMonth = data.reduce((min, item) => item.count < min.count ? item : min, data[0] || { month: 'N/A', count: 0 });
    
    return {
      averagePerMonth,
      growthPercentage,
      peakMonth,
      lowestMonth
    };
  }, [data, totalDeveloperMonths]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Active Developers Progress</CardTitle>
        <CardDescription>
          Tracking developer engagement from January to September 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{uniqueDevelopersAcrossPeriod}</div>
            <div className="text-sm text-muted-foreground">Unique Developers</div>
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
            <li>• <strong>{uniqueDevelopersAcrossPeriod}</strong> unique developers contributed across Jan-Sep 2025</li>
            <li>• <strong>{totalDeveloperMonths}</strong> total developer-months of activity in 2025</li>
            <li>• {metrics.growthPercentage >= 0 ? 'Growing' : 'Declining'} monthly engagement from Jan to Sep 2025</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
