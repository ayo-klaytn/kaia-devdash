"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive bar chart"

export type SocialMetric = {
  id: string;
  name: string;
  date: string;
  impressions: number;
  engagements: number;
  likes: number;
  profileVisits: number;
  mediaViews: number;
  shares: number;
  bookmarks: number;
  newFollows: number;
  unfollows: number;
  replies: number;
  reposts: number;
  createPost: number;
  videoViews: number;
  createdAt: string;
  updatedAt: string;
};

const chartConfig = {
  impressions: {
    label: "Impressions",
    color: "hsl(var(--chart-1))",
  },
  engagements: {
    label: "Engagements",
    color: "hsl(var(--chart-2))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-3))",
  },
  profileVisits: {
    label: "Profile Visits",
    color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig

export function XChart({ chartData }: { chartData: SocialMetric[] }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("impressions")
  const [mounted, setMounted] = React.useState(false)

  // Handle hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const total = React.useMemo(
    () => {
      if (!mounted) {
        return {
          impressions: 0,
          engagements: 0,
          likes: 0,
          profileVisits: 0,
        };
      }

      // Ensure we have valid data
      const validData = Array.isArray(chartData) ? chartData : [];
      
      if (validData.length === 0) {
        return {
          impressions: 0,
          engagements: 0,
          likes: 0,
          profileVisits: 0,
        };
      }
      
      return {
        impressions: validData.reduce((acc, curr) => acc + (curr?.impressions || 0), 0),
        engagements: validData.reduce((acc, curr) => acc + (curr?.engagements || 0), 0),
        likes: validData.reduce((acc, curr) => acc + (curr?.likes || 0), 0),
        profileVisits: validData.reduce((acc, curr) => acc + (curr?.profileVisits || 0), 0),
      };
    },
    [chartData, mounted]
  )

  if (!mounted) {
    return (
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Kaia Dev Intern</CardTitle>
            <CardDescription>
              Loading...
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Kaia Dev Intern</CardTitle>
          <CardDescription>
            Showing total traffic in the last year
          </CardDescription>
        </div>
        <div className="flex">
          {["impressions", "engagements", "likes", "profileVisits"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={mounted && Array.isArray(chartData) && chartData.length > 0 ? chartData : []}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
