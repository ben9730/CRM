"use client";

import { Card, CardContent } from "@/components/ui/card";
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

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card/60 p-5 border border-border/40 hover:bg-card/80 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={`rounded-md p-1.5 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
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

  const wonThisMonth = 3; // static realistic number for prototype

  const today = new Date().toISOString().split("T")[0];
  const tasksDueToday = mockTasks.filter(
    (t) =>
      t.status !== "completed" &&
      (t.dueDate <= today)
  ).length;

  const metrics = [
    {
      icon: TrendingUp,
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      sublabel: "excl. closed lost",
      iconColor: "bg-primary/10 text-primary",
    },
    {
      icon: BarChart3,
      label: "Active Deals",
      value: String(activeDeals),
      sublabel: "in progress",
      iconColor: "bg-blue-500/10 text-blue-400",
    },
    {
      icon: Trophy,
      label: "Won This Month",
      value: String(wonThisMonth),
      sublabel: "deals closed",
      iconColor: "bg-emerald-500/10 text-emerald-400",
    },
    {
      icon: CheckSquare,
      label: "Tasks Due",
      value: String(tasksDueToday),
      sublabel: "today & overdue",
      iconColor: "bg-amber-500/10 text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
