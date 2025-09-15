"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface BokChartProps {
  data: Array<{
    month: string;
    impressions: number;
    engagementRate: number;
  }>;
}

export function BokChart({ data }: BokChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <div className="space-y-4">
          {/* Impressions Bar Chart */}
          <div className="h-40">
            <h3 className="text-sm font-medium mb-2">Monthly Impressions</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="impressions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Engagement Rate Line Chart */}
          <div className="h-40">
            <h3 className="text-sm font-medium mb-2">Engagement Rate (%)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="engagementRate" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
