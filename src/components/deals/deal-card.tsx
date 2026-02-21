"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "@/data/mock-deals";
import { Calendar, Building2 } from "lucide-react";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Stage-specific left border + value badge colors
const STAGE_COLORS: Record<
  string,
  { border: string; valueBg: string; valueText: string; glowColor: string }
> = {
  Prospecting: {
    border: "oklch(0.60 0.22 270)",
    valueBg: "oklch(0.60 0.22 270 / 12%)",
    valueText: "oklch(0.75 0.18 270)",
    glowColor: "oklch(0.60 0.22 270 / 10%)",
  },
  Qualification: {
    border: "oklch(0.62 0.20 240)",
    valueBg: "oklch(0.62 0.20 240 / 12%)",
    valueText: "oklch(0.75 0.18 240)",
    glowColor: "oklch(0.62 0.20 240 / 10%)",
  },
  Proposal: {
    border: "oklch(0.65 0.24 280)",
    valueBg: "oklch(0.65 0.24 280 / 12%)",
    valueText: "oklch(0.78 0.20 280)",
    glowColor: "oklch(0.65 0.24 280 / 12%)",
  },
  Negotiation: {
    border: "oklch(0.75 0.18 80)",
    valueBg: "oklch(0.75 0.18 80 / 12%)",
    valueText: "oklch(0.82 0.16 80)",
    glowColor: "oklch(0.75 0.18 80 / 10%)",
  },
  "Closed Won": {
    border: "oklch(0.65 0.18 160)",
    valueBg: "oklch(0.65 0.18 160 / 12%)",
    valueText: "oklch(0.78 0.16 160)",
    glowColor: "oklch(0.65 0.18 160 / 10%)",
  },
  "Closed Lost": {
    border: "oklch(0.40 0 0)",
    valueBg: "oklch(0.40 0 0 / 10%)",
    valueText: "oklch(0.55 0 0)",
    glowColor: "oklch(0.40 0 0 / 6%)",
  },
};

interface DealCardProps {
  deal: Deal;
  stage?: string;
  isOverlay?: boolean;
}

export function DealCard({ deal, stage, isOverlay = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const stageKey = stage ?? deal.stage;
  const colors = STAGE_COLORS[stageKey] ?? STAGE_COLORS["Prospecting"];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isOverlay) {
    return (
      <div
        style={{
          background: "oklch(0.16 0.008 280)",
          border: `1px solid ${colors.border}50`,
          borderLeft: `3px solid ${colors.border}`,
          borderRadius: "8px",
          padding: "12px",
          transform: "rotate(2deg) scale(1.03)",
          boxShadow: `0 16px 40px -8px oklch(0 0 0 / 60%), 0 0 24px -6px ${colors.glowColor}, 0 0 0 1px ${colors.border}20`,
          cursor: "grabbing",
          width: "248px",
          pointerEvents: "none",
        }}
      >
        <CardContent deal={deal} colors={colors} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? "transparent" : "oklch(0.135 0.006 280)",
        border: isDragging
          ? `1px dashed oklch(1 0 0 / 10%)`
          : `1px solid oklch(1 0 0 / 6%)`,
        borderLeft: isDragging
          ? `3px dashed ${colors.border}30`
          : `3px solid ${colors.border}`,
        borderRadius: "8px",
        padding: "12px",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.3 : 1,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      className="group select-none hover:shadow-md"
      onMouseEnter={(e) => {
        if (isDragging) return;
        const el = e.currentTarget;
        el.style.borderColor = `${colors.border}30`;
        el.style.borderLeftColor = colors.border;
        el.style.boxShadow = `0 4px 16px -4px oklch(0 0 0 / 30%), 0 0 12px -4px ${colors.glowColor}`;
        el.style.background = "oklch(0.15 0.008 280)";
      }}
      onMouseLeave={(e) => {
        if (isDragging) return;
        const el = e.currentTarget;
        el.style.borderColor = "oklch(1 0 0 / 6%)";
        el.style.borderLeftColor = colors.border;
        el.style.boxShadow = "none";
        el.style.background = "oklch(0.135 0.006 280)";
      }}
      {...attributes}
      {...listeners}
    >
      <CardContent deal={deal} colors={colors} />
    </div>
  );
}

interface CardContentProps {
  deal: Deal;
  colors: {
    border: string;
    valueBg: string;
    valueText: string;
    glowColor: string;
  };
}

function CardContent({ deal, colors }: CardContentProps) {
  return (
    <>
      {/* Deal name + value badge row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p
          className="text-[13px] font-semibold leading-snug line-clamp-2 flex-1"
          style={{ color: "oklch(0.90 0.01 280)" }}
        >
          {deal.name}
        </p>
        {/* Value badge */}
        <div
          className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums"
          style={{
            background: colors.valueBg,
            color: colors.valueText,
            border: `1px solid ${colors.valueText}20`,
          }}
        >
          {formatCurrency(deal.value)}
        </div>
      </div>

      {/* Organization */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Building2
          className="h-3 w-3 flex-shrink-0"
          style={{ color: "oklch(0.50 0 0)" }}
        />
        <p
          className="text-[11px] truncate"
          style={{ color: "oklch(0.55 0 0)" }}
        >
          {deal.organizationName}
        </p>
      </div>

      {/* Contact + Close date row */}
      <div className="flex items-center justify-between mt-1">
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold flex-shrink-0"
          style={{
            background: `${colors.border}20`,
            color: colors.valueText,
            border: `1px solid ${colors.border}30`,
          }}
          title={deal.contactName}
        >
          {deal.contactName.charAt(0)}
        </div>
        <div className="flex items-center gap-1">
          <Calendar
            className="h-2.5 w-2.5"
            style={{ color: "oklch(0.45 0 0)" }}
          />
          <span
            className="text-[10px] tabular-nums"
            style={{ color: "oklch(0.48 0 0)" }}
          >
            {formatDate(deal.expectedCloseDate)}
          </span>
        </div>
      </div>
    </>
  );
}
