"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type ApiPeriod = {
  id: string;
  label: string;
  brand: "klaytn" | "kaia";
};

type ApiResponse = {
  metric: "mad" | "new";
  periods: ApiPeriod[];
  items: Array<{
    month: string;
    values: Record<string, number>;
  }>;
};

type MetricOption = {
  value: "mad" | "new";
  label: string;
  description: string;
};

const METRIC_OPTIONS: MetricOption[] = [
  {
    value: "mad",
    label: "Monthly Active Developers",
    description: "Distinct committers per month",
  },
  {
    value: "new",
    label: "New Developers",
    description: "First-time committers each month",
  },
];

const AUG_2024 = "2024-08-01";

function monthLabel(month: string) {
  const date = new Date(month);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

interface ChartDataPoint {
  month: string;
  label: string;
  [periodId: string]: string | number;
}

type CustomPayload = TooltipProps<number, string>["payload"];

function MetricTooltip({
  active,
  payload,
  label,
  metric,
  metricLabel,
  chartConfig,
  periodOrder,
}: {
  active?: boolean;
  payload?: CustomPayload;
  label?: string;
  metric: "mad" | "new";
  metricLabel: string;
  chartConfig: Record<string, { label: string; color: string }>;
  periodOrder: string[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="font-medium">{label}</div>
      <div className="mt-1 flex flex-col gap-1">
        {periodOrder.map((periodId) => {
          const entry = payload.find((p) => p.dataKey === periodId);
          if (!entry || typeof entry.value !== "number" || entry.value === 0) {
            return null;
          }

          const color =
            chartConfig[periodId]?.color ?? "hsl(var(--foreground))";
          const seriesLabel = chartConfig[periodId]?.label ?? periodId;
          return (
            <div key={periodId} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{seriesLabel}</span>
              <span className="font-mono text-foreground">
                {entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-muted-foreground">{metricLabel}</div>
    </div>
  );
}

export function MultiYearDeveloperMetrics() {
  const [metric, setMetric] = useState<"mad" | "new">("mad");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/view/developer-metrics?metric=${metric}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`API responded with ${res.status}`);
        }
        const json = (await res.json()) as ApiResponse;
        if (!isCancelled) {
          setData(json);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    fetchMetrics();
    return () => {
      isCancelled = true;
    };
  }, [metric]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data) return [];
    return data.items.map((item) => {
      const point: ChartDataPoint = {
        month: item.month,
        label: monthLabel(item.month),
      };
      for (const period of data.periods) {
        point[period.id] = item.values[period.id] ?? 0;
      }
      return point;
    });
  }, [data]);

  const metricLabel = metric === "mad" ? "Active developers" : "New developers";

  const chartConfig = useMemo(() => {
    if (!data) return {};
    const colors = ["#2563eb", "#f97316", "#7c3aed", "#059669", "#dc2626"];
    return data.periods.reduce<Record<string, { label: string; color: string }>>(
      (acc, period, index) => {
        acc[period.id] = {
          label: period.label,
          color: colors[index % colors.length],
        };
        return acc;
      },
      {}
    );
  }, [data]);

  return (
    <div className="flex flex-col gap-4 border rounded-md p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Multi-year Developer Trends</h2>
          <p className="text-sm text-muted-foreground">
            Calendar-month comparison across 2022–2024 and Kaia era.
          </p>
        </div>
        <div className="flex gap-2">
          {METRIC_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setMetric(option.value)}
              className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                metric === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {METRIC_OPTIONS.find((opt) => opt.value === metric)?.description}
      </p>
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Failed to load developer metrics: {error}
        </div>
      )}
      <div className="w-full">
        {loading || !data ? (
          <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
            Loading developer metrics…
          </div>
        ) : (
          <ChartContainer className="h-[420px] w-full" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 24, bottom: 20, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={18}
                />
                <YAxis tick={{ fontSize: 11 }} width={48} />
                <RechartsTooltip
                  content={
                    <MetricTooltip
                      metric={metric}
                      metricLabel={metricLabel}
                      chartConfig={chartConfig}
                      periodOrder={data.periods.map((p) => p.id)}
                    />
                  }
                />
                <ChartLegend
                  verticalAlign="top"
                  content={<ChartLegendContent className="justify-start" />}
                />
                {data.periods.map((period) => (
                  <Line
                    key={period.id}
                    type="monotone"
                    dataKey={period.id}
                    name={period.label}
                    stroke={chartConfig[period.id]?.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
                <ReferenceLine
                  x={monthLabel(AUG_2024)}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="4 4"
                  label={{
                    value: "Kaia Launch (Aug 2024)",
                    position: "top",
                    fill: "hsl(var(--primary))",
                    fontSize: 11,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}


