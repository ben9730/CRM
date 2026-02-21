"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Deal } from "@/data/mock-deals";
import { DealCard } from "./deal-card";

function formatCurrency(value: number): string {
  if (value === 0) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

interface StageConfig {
  dot: string;
  topGradient: string;
  dropGlow: string;
  emptyDash: string;
}

const STAGE_CONFIG: Record<string, StageConfig> = {
  Prospecting: {
    dot: "bg-blue-violet-400",
    topGradient:
      "linear-gradient(90deg, transparent 0%, oklch(0.60 0.22 270 / 70%) 50%, transparent 100%)",
    dropGlow: "oklch(0.60 0.22 270 / 8%)",
    emptyDash: "border-blue-900/40",
  },
  Qualification: {
    dot: "bg-blue-400",
    topGradient:
      "linear-gradient(90deg, transparent 0%, oklch(0.62 0.20 240 / 70%) 50%, transparent 100%)",
    dropGlow: "oklch(0.62 0.20 240 / 8%)",
    emptyDash: "border-blue-900/40",
  },
  Proposal: {
    dot: "bg-violet-400",
    topGradient:
      "linear-gradient(90deg, transparent 0%, oklch(0.65 0.24 280 / 70%) 50%, transparent 100%)",
    dropGlow: "oklch(0.65 0.24 280 / 8%)",
    emptyDash: "border-violet-900/40",
  },
  Negotiation: {
    dot: "bg-amber-400",
    topGradient:
      "linear-gradient(90deg, transparent 0%, oklch(0.75 0.18 80 / 70%) 50%, transparent 100%)",
    dropGlow: "oklch(0.75 0.18 80 / 8%)",
    emptyDash: "border-amber-900/40",
  },
  "Closed Won": {
    dot: "bg-emerald-400",
    topGradient:
      "linear-gradient(90deg, transparent 0%, oklch(0.65 0.18 160 / 70%) 50%, transparent 100%)",
    dropGlow: "oklch(0.65 0.18 160 / 8%)",
    emptyDash: "border-emerald-900/40",
  },
  "Closed Lost": {
    dot: "bg-zinc-500",
    topGradient:
      "linear-gradient(90deg, transparent 0%, oklch(0.40 0 0 / 60%) 50%, transparent 100%)",
    dropGlow: "oklch(0.40 0 0 / 6%)",
    emptyDash: "border-zinc-800/40",
  },
};

// Dot color as inline style since dynamic OKLCH values aren't Tailwind classes
const STAGE_DOT_COLOR: Record<string, string> = {
  Prospecting: "oklch(0.60 0.22 270)",
  Qualification: "oklch(0.62 0.20 240)",
  Proposal: "oklch(0.65 0.24 280)",
  Negotiation: "oklch(0.75 0.18 80)",
  "Closed Won": "oklch(0.65 0.18 160)",
  "Closed Lost": "oklch(0.50 0 0)",
};

interface KanbanColumnProps {
  stage: string;
  deals: Deal[];
  animationDelay?: number;
}

export function KanbanColumn({ stage, deals, animationDelay = 0 }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const config = STAGE_CONFIG[stage] ?? STAGE_CONFIG["Prospecting"];
  const dotColor = STAGE_DOT_COLOR[stage] ?? "oklch(0.65 0.24 280)";

  return (
    <div
      className="animate-fade-in flex w-[272px] flex-shrink-0 flex-col rounded-xl overflow-hidden"
      style={{
        animationDelay: `${animationDelay}ms`,
        opacity: 0,
        background: "oklch(0.12 0.004 280)",
        border: "1px solid oklch(1 0 0 / 6%)",
      }}
    >
      {/* Gradient top border accent */}
      <div
        style={{
          height: "2px",
          background: config.topGradient,
          flexShrink: 0,
        }}
      />

      {/* Column header */}
      <div
        className="flex items-center justify-between px-3.5 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 5%)" }}
      >
        <div className="flex items-center gap-2">
          {/* Colored dot indicator */}
          <div
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{
              background: dotColor,
              boxShadow: `0 0 6px 1px ${dotColor}60`,
            }}
          />
          <span className="text-[13px] font-semibold text-foreground/85 tracking-tight">
            {stage}
          </span>
          {/* Count badge */}
          <div
            className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
            style={{
              background: "oklch(1 0 0 / 6%)",
              color: "oklch(0.70 0 0)",
            }}
          >
            {deals.length}
          </div>
        </div>

        {/* Column total value */}
        {deals.length > 0 && (
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{ color: "oklch(0.55 0 0)" }}
          >
            {formatCurrency(totalValue)}
          </span>
        )}
      </div>

      {/* Cards list — droppable zone */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 p-2.5 flex-1 overflow-y-auto min-h-[200px] transition-colors duration-200"
        style={{
          backgroundColor: isOver ? config.dropGlow : "transparent",
          ...(isOver
            ? {
                outline: `1px dashed ${dotColor}40`,
                outlineOffset: "-4px",
              }
            : {}),
        }}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} stage={stage} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {deals.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center flex-1 py-10 rounded-lg border border-dashed ${config.emptyDash} select-none transition-all duration-300`}
            style={
              isOver
                ? {
                    borderColor: `${dotColor}50`,
                    backgroundColor: config.dropGlow,
                  }
                : {}
            }
          >
            <div
              className="h-8 w-8 rounded-full border border-dashed mb-2.5 flex items-center justify-center"
              style={{ borderColor: `${dotColor}30` }}
            >
              <div
                className="h-2 w-2 rounded-full opacity-30"
                style={{ background: dotColor }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground/40 font-medium tracking-wide">
              Drop deals here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
