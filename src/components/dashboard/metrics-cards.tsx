import { TrendingUp, BarChart3, CheckSquare, AlertTriangle } from "lucide-react";

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
  isAlert?: boolean;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  iconGradient,
  iconColor,
  accent,
  isAlert,
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
            className={`tabular-nums text-3xl font-bold tracking-tight ${
              isAlert ? "text-red-400" : "text-gradient-violet"
            }`}
          >
            {value}
          </span>
          {sublabel && (
            <span className="text-[11px] text-muted-foreground/50 font-light">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricsCardsProps {
  totalDeals: number;
  totalPipelineValue: number;
  tasksDueToday: number;
  overdueTaskCount: number;
}

export function MetricsCards({
  totalDeals,
  totalPipelineValue,
  tasksDueToday,
  overdueTaskCount,
}: MetricsCardsProps) {
  const metrics: MetricCardProps[] = [
    {
      icon: TrendingUp,
      label: "Pipeline Value",
      value: formatCurrency(totalPipelineValue),
      sublabel: "active deals excl. lost",
      iconGradient:
        "linear-gradient(135deg, oklch(0.65 0.24 280 / 15%), oklch(0.55 0.28 300 / 10%))",
      iconColor: "text-primary",
      accent:
        "linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 40%), transparent)",
    },
    {
      icon: BarChart3,
      label: "Active Deals",
      value: String(totalDeals),
      sublabel: "open pipeline stages",
      iconGradient:
        "linear-gradient(135deg, oklch(0.60 0.18 220 / 15%), oklch(0.50 0.20 240 / 10%))",
      iconColor: "text-blue-400",
      accent:
        "linear-gradient(90deg, transparent, oklch(0.60 0.18 220 / 35%), transparent)",
    },
    {
      icon: CheckSquare,
      label: "Due Today",
      value: String(tasksDueToday),
      sublabel: "tasks due today",
      iconGradient:
        "linear-gradient(135deg, oklch(0.70 0.20 60 / 15%), oklch(0.65 0.22 45 / 10%))",
      iconColor: "text-amber-400",
      accent:
        "linear-gradient(90deg, transparent, oklch(0.70 0.20 60 / 35%), transparent)",
    },
    {
      icon: AlertTriangle,
      label: "Overdue",
      value: String(overdueTaskCount),
      sublabel: "tasks past due date",
      isAlert: overdueTaskCount > 0,
      iconGradient:
        overdueTaskCount > 0
          ? "linear-gradient(135deg, oklch(0.55 0.22 25 / 15%), oklch(0.50 0.20 20 / 10%))"
          : "linear-gradient(135deg, oklch(0.40 0.05 280 / 15%), oklch(0.35 0.04 280 / 10%))",
      iconColor: overdueTaskCount > 0 ? "text-red-400" : "text-muted-foreground/50",
      accent:
        overdueTaskCount > 0
          ? "linear-gradient(90deg, transparent, oklch(0.55 0.22 25 / 35%), transparent)"
          : "linear-gradient(90deg, transparent, oklch(0.40 0.05 280 / 20%), transparent)",
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
