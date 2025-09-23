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
// Charts now accept data via props from the API; no mocks

export const description = "An interactive bar chart"

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-2))",
  }
} satisfies ChartConfig

type DailyPoint = { date: string; views: number; visitors?: number }
type MonthlyPoint = { month: string; views: number }

type WebTrafficChartProps = {
  data: DailyPoint[]
  title?: string
  description?: string
}

export function WebTrafficChart({ data, title = "Daily Web Traffic", description = "Showing last 30 days" }: WebTrafficChartProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("views")

  const total = React.useMemo(
    () => ({
      views: (data ?? []).reduce((acc, curr) => acc + (curr?.views ?? 0), 0),
      visitors: (data ?? []).reduce((acc, curr) => acc + (curr?.visitors ?? 0), 0),
    }),
    [data]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex">
          {["views", "visitors"].map((key) => {
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
            data={data}
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
                const ts = typeof value === 'string' ? Number(value) : (value as number)
                const date = new Date(ts)
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

// Monthly views-only chart (x: month, y: views)
export function MonthlyViewsChart({ data, title = "Docs Web Traffic", description = "Showing total traffic in the last year" }: { data: MonthlyPoint[]; title?: string; description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={{ views: { label: "Views", color: "hsl(var(--chart-1))" } } as ChartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={<ChartTooltipContent className="w-[150px]" nameKey="views" />}
            />
            <Bar dataKey="views" fill={`var(--color-views)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
