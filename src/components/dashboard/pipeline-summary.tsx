"use client";

import { useState } from "react";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

interface PipelineStageData {
  id: string;
  name: string;
  color: string | null;
  displayOrder: number;
  count: number;
  value: number;
  isWon: boolean;
  isLost: boolean;
}

interface PipelineSummaryProps {
  pipelineByStage: PipelineStageData[];
}

// Convert hex color to OKLCH-like gradient using color-mix
function stageGradient(hexColor: string | null): string {
  const color = hexColor ?? "#6366f1";
  return `linear-gradient(90deg, color-mix(in oklch, ${color} 90%, transparent) 0%, color-mix(in oklch, ${color} 60%, transparent) 100%)`;
}

function stageDot(hexColor: string | null): string {
  return hexColor ?? "#6366f1";
}

export function PipelineSummary({ pipelineByStage }: PipelineSummaryProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const maxValue = Math.max(...pipelineByStage.map((s) => s.value), 1);

  const totalActive = pipelineByStage
    .filter((s) => !s.isLost)
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
        {pipelineByStage.length === 0 ? (
          <p className="text-sm text-muted-foreground/40 text-center py-4">
            No deals in pipeline yet.
          </p>
        ) : (
          pipelineByStage.map(({ id, name, color, count, value }) => {
            const widthPct =
              value === 0 ? 0 : Math.max((value / maxValue) * 100, 4);
            const isHovered = hoveredStage === id;

            return (
              <div
                key={id}
                className="group/row cursor-default"
                onMouseEnter={() => setHoveredStage(id)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                {/* Label row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0 transition-transform duration-200 group-hover/row:scale-125"
                      style={{ background: stageDot(color) }}
                    />
                    <span
                      className={`text-xs font-medium transition-colors duration-200 ${
                        isHovered
                          ? "text-foreground/95"
                          : "text-foreground/70"
                      }`}
                    >
                      {name}
                    </span>
                    {/* Deal count pill */}
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
                      isHovered
                        ? "text-foreground/90"
                        : "text-muted-foreground/60"
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
                      background: stageGradient(color),
                      opacity: isHovered ? 1 : 0.75,
                      filter: isHovered ? "brightness(1.15)" : "brightness(1)",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
