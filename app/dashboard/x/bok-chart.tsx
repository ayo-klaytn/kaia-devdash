"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface BokChartProps {
  data: Array<{
    month: string;
    impressions: number;
    engagementRate: number;
    newFollowers: number;
  }>;
}

const axisStyle = { fontSize: 12, fill: "currentColor" };

export function BokChart({ data }: BokChartProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue="impressions" className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Switch between monthly impressions, engagement rate, and follower growth.
            </p>
          </div>
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="impressions">Impressions</TabsTrigger>
            <TabsTrigger value="engagement">Engagement Rate</TabsTrigger>
            <TabsTrigger value="followers">New Followers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="impressions" className="mt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.2 }} />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={axisStyle} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.2 }} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="impressions" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.2 }} />
                <YAxis tickFormatter={(value) => `${value}%`} tick={axisStyle} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.2 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Line type="monotone" dataKey="engagementRate" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.2 }} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.2 }} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Area type="monotone" dataKey="newFollowers" stroke="#2563eb" fill="url(#followersGradient)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
