"use client";

import { useState } from "react";
import { mockDeals, PIPELINE_STAGES } from "@/data/mock-deals";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

interface StageConfig {
  gradient: string;
  dot: string;
  label: string;
}

const STAGE_CONFIG: Record<string, StageConfig> = {
  Prospecting: {
    gradient:
      "linear-gradient(90deg, oklch(0.65 0.24 280 / 90%), oklch(0.55 0.28 300 / 70%))",
    dot: "oklch(0.65 0.24 280)",
    label: "Prospecting",
  },
  Qualification: {
    gradient:
      "linear-gradient(90deg, oklch(0.60 0.22 260 / 80%), oklch(0.55 0.24 280 / 60%))",
    dot: "oklch(0.60 0.22 260)",
    label: "Qualification",
  },
  Proposal: {
    gradient:
      "linear-gradient(90deg, oklch(0.60 0.18 220 / 80%), oklch(0.55 0.20 240 / 60%))",
    dot: "oklch(0.60 0.18 220)",
    label: "Proposal",
  },
  Negotiation: {
    gradient:
      "linear-gradient(90deg, oklch(0.65 0.20 180 / 80%), oklch(0.58 0.22 200 / 60%))",
    dot: "oklch(0.65 0.20 180)",
    label: "Negotiation",
  },
  "Closed Won": {
    gradient:
      "linear-gradient(90deg, oklch(0.70 0.18 150 / 85%), oklch(0.62 0.20 160 / 65%))",
    dot: "oklch(0.70 0.18 150)",
    label: "Closed Won",
  },
  "Closed Lost": {
    gradient:
      "linear-gradient(90deg, oklch(0.50 0.14 30 / 50%), oklch(0.45 0.12 20 / 35%))",
    dot: "oklch(0.50 0.14 30)",
    label: "Closed Lost",
  },
};

export function PipelineSummary() {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const stageData = PIPELINE_STAGES.map((stage) => {
    const deals = mockDeals.filter((d) => d.stage === stage);
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const config = STAGE_CONFIG[stage];
    return { stage, count: deals.length, value: totalValue, config, deals };
  });

  const maxValue = Math.max(...stageData.map((s) => s.value), 1);

  const totalActive = stageData
    .filter((s) => s.stage !== "Closed Lost" && s.stage !== "Closed Won")
    .reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="glow-card gradient-border-top bg-noise rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/20">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Pipeline
            </h2>
            <p className="mt-1 text-xl font-bold tabular-nums text-gradient-violet">
              {formatCurrency(totalActive)}
            </p>
            <p className="text-[11px] text-muted-foreground/50 font-light mt-0.5">
              active pipeline value
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
              by stage
            </span>
          </div>
        </div>
      </div>

      {/* Stage bars */}
      <div className="px-5 py-4 space-y-3">
        {stageData.map(({ stage, count, value, config, deals }) => {
          const widthPct =
            value === 0 ? 0 : Math.max((value / maxValue) * 100, 4);
          const isHovered = hoveredStage === stage;

          return (
            <div
              key={stage}
              className="group/row cursor-default"
              onMouseEnter={() => setHoveredStage(stage)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0 transition-transform duration-200 group-hover/row:scale-125"
                    style={{ background: config.dot }}
                  />
                  <span
                    className={`text-xs font-medium transition-colors duration-200 ${
                      isHovered
                        ? "text-foreground/95"
                        : "text-foreground/70"
                    }`}
                  >
                    {stage}
                  </span>
                  {/* Deal pill — revealed on hover */}
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-all duration-200 ${
                      isHovered
                        ? "opacity-100 bg-white/5 text-muted-foreground/70"
                        : "opacity-0"
                    }`}
                  >
                    {count} deal{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold tabular-nums transition-all duration-200 ${
                    isHovered ? "text-foreground/90" : "text-muted-foreground/60"
                  }`}
                >
                  {value > 0 ? formatCurrency(value) : "—"}
                </span>
              </div>

              {/* Bar track */}
              <div className="h-1.5 w-full rounded-full bg-white/4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${widthPct}%`,
                    background: config.gradient,
                    opacity: isHovered ? 1 : 0.75,
                    filter: isHovered
                      ? "brightness(1.15)"
                      : "brightness(1)",
                  }}
                />
              </div>

              {/* Expanded deal list on hover */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isHovered && deals.length > 0
                    ? "max-h-40 opacity-100 mt-2"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-1 pl-3.5 border-l border-white/6">
                  {deals.slice(0, 3).map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between py-0.5"
                    >
                      <span className="text-[11px] text-muted-foreground/60 truncate max-w-[60%]">
                        {deal.name}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground/50 font-mono">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>
                  ))}
                  {deals.length > 3 && (
                    <p className="text-[10px] text-muted-foreground/40 italic">
                      +{deals.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
