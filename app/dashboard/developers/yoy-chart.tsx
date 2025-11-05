"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

type Props = {
  current: number
  previous: number
}

export function YoYChart({ current, previous }: Props) {
  const data = [
    { label: "Current", value: current, key: "current" },
    { label: "Previous", value: previous, key: "previous" },
  ]

  return (
    <ChartContainer
      className="w-full max-w-xl"
      config={{
        current: { label: "Current", color: "hsl(var(--primary))" },
        previous: { label: "Previous", color: "hsl(var(--muted-foreground))" },
      }}
    >
      <BarChart width={500} height={260} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} content={<ChartTooltipContent />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}


