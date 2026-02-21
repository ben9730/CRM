"use client";

import { mockDeals } from "@/data/mock-deals";
import { mockTasks } from "@/data/mock-tasks";
import { TrendingUp, BarChart3, Trophy, CheckSquare } from "lucide-react";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  iconGradient: string;
  iconColor: string;
  accent: string;
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  iconGradient,
  iconColor,
  accent,
  trend,
  trendUp,
}: MetricCardProps) {
  return (
    <div
      className={`glow-card gradient-border-top bg-noise group relative overflow-hidden rounded-xl p-5 cursor-default`}
      style={{ borderTop: "none" }}
    >
      {/* Subtle top gradient accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: accent }}
      />

      {/* Background ambient glow on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% -20%, ${accent.replace("0.4)", "0.04)")}, transparent 70%)`,
        }}
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {label}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: iconGradient }}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span
            className="text-gradient-violet tabular-nums text-3xl font-bold tracking-tight"
          >
            {value}
          </span>
          <div className="flex items-center gap-2">
            {sublabel && (
              <span className="text-[11px] text-muted-foreground/50 font-light">
                {sublabel}
              </span>
            )}
            {trend && (
              <span
                className={`text-[10px] font-semibold tabular-nums ${
                  trendUp ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {trendUp ? "+" : ""}{trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetricsCards() {
  const pipelineValue = mockDeals
    .filter((d) => d.stage !== "Closed Lost")
    .reduce((sum, d) => sum + d.value, 0);

  const activeDeals = mockDeals.filter(
    (d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost"
  ).length;

  const wonThisMonth = 1; // BioVault LIMS Connector closed Jan 31

  const today = new Date().toISOString().split("T")[0];
  const tasksDueToday = mockTasks.filter(
    (t) => t.status !== "completed" && t.dueDate <= today
  ).length;

  const metrics: MetricCardProps[] = [
    {
      icon: TrendingUp,
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      sublabel: "excl. closed lost",
      trend: "12.4%",
      trendUp: true,
      iconGradient:
        "linear-gradient(135deg, oklch(0.65 0.24 280 / 15%), oklch(0.55 0.28 300 / 10%))",
      iconColor: "text-primary",
      accent:
        "linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 40%), transparent)",
    },
    {
      icon: BarChart3,
      label: "Active Deals",
      value: String(activeDeals),
      sublabel: "across all stages",
      trend: "2",
      trendUp: true,
      iconGradient:
        "linear-gradient(135deg, oklch(0.60 0.18 220 / 15%), oklch(0.50 0.20 240 / 10%))",
      iconColor: "text-blue-400",
      accent:
        "linear-gradient(90deg, transparent, oklch(0.60 0.18 220 / 35%), transparent)",
    },
    {
      icon: Trophy,
      label: "Won This Month",
      value: String(wonThisMonth),
      sublabel: "deals closed",
      iconGradient:
        "linear-gradient(135deg, oklch(0.70 0.18 150 / 15%), oklch(0.60 0.20 160 / 10%))",
      iconColor: "text-emerald-400",
      accent:
        "linear-gradient(90deg, transparent, oklch(0.70 0.18 150 / 35%), transparent)",
    },
    {
      icon: CheckSquare,
      label: "Tasks Due",
      value: String(tasksDueToday),
      sublabel: "today & overdue",
      iconGradient:
        "linear-gradient(135deg, oklch(0.70 0.20 60 / 15%), oklch(0.65 0.22 45 / 10%))",
      iconColor: "text-amber-400",
      accent:
        "linear-gradient(90deg, transparent, oklch(0.70 0.20 60 / 35%), transparent)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className="animate-fade-in opacity-0"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <MetricCard {...metric} />
        </div>
      ))}
    </div>
  );
}
