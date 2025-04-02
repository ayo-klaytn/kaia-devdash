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
// import kaiadevintern_account_overview_analytics from "@/lib/data/kaiadevintern_account_overview_analytics.json"
import kaiaDevSocial from "@/lib/mocks/kaia-dev-social.json"
export const description = "An interactive bar chart"

const chartData = kaiaDevSocial.community

const chartConfig = {
  members: {
    label: "Members",
    color: "hsl(var(--chart-1))",
  },
  new_posts: {
    label: "New Posts",
    color: "hsl(var(--chart-2))",
  },
  new_likes: {
    label: "New Likes",
    color: "hsl(var(--chart-3))",
  },
  new_replies: {
    label: "New Replies",
    color: "hsl(var(--chart-4))",
  },
  new_unique_posters: {
    label: "New Unique Posters",
    color: "hsl(var(--chart-5))",
  },
  new_members: {
    label: "New Members",
    color: "hsl(var(--chart-6))",
  }
} satisfies ChartConfig

export function XCommunityChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("members")

  const total = React.useMemo(
    () => ({
      members: chartData.reduce((acc, curr) => acc + curr.members, 0),
      new_posts: chartData.reduce((acc, curr) => acc + curr.new_posts, 0),
      new_likes: chartData.reduce((acc, curr) => acc + curr.new_likes, 0),
      new_replies: chartData.reduce((acc, curr) => acc + curr.new_replies, 0),
      new_unique_posters: chartData.reduce((acc, curr) => acc + curr.new_unique_posters, 0),
      new_members: chartData.reduce((acc, curr) => acc + curr.new_members, 0),
    }),
    []
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Kaia Dev community on X</CardTitle>
          <CardDescription>
            Showing all analytics
          </CardDescription>
        </div>
        <div className="flex">
          {["members", "new_posts", "new_likes", "new_replies", "new_unique_posters", "new_members"].map((key) => {
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
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value * 1000) // Convert Unix timestamp to milliseconds
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
                    return new Date(value * 1000).toLocaleDateString("en-US", { // Convert Unix timestamp to milliseconds
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
