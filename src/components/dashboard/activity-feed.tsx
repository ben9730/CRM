"use client";

import { mockInteractions } from "@/data/mock-interactions";
import type { InteractionType } from "@/data/mock-interactions";
import { Phone, Mail, Calendar, FileText } from "lucide-react";

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TypeConfig {
  icon: React.ElementType;
  color: string;
  iconBg: string;
  edgeColor: string;
  label: string;
}

const TYPE_CONFIG: Record<InteractionType, TypeConfig> = {
  call: {
    icon: Phone,
    color: "text-emerald-400",
    iconBg: "oklch(0.70 0.18 150 / 12%)",
    edgeColor: "oklch(0.70 0.18 150)",
    label: "Call",
  },
  email: {
    icon: Mail,
    color: "text-blue-400",
    iconBg: "oklch(0.60 0.18 220 / 12%)",
    edgeColor: "oklch(0.60 0.18 220)",
    label: "Email",
  },
  meeting: {
    icon: Calendar,
    color: "text-primary",
    iconBg: "oklch(0.65 0.24 280 / 12%)",
    edgeColor: "oklch(0.65 0.24 280)",
    label: "Meeting",
  },
  note: {
    icon: FileText,
    color: "text-amber-400",
    iconBg: "oklch(0.70 0.20 60 / 12%)",
    edgeColor: "oklch(0.70 0.20 60)",
    label: "Note",
  },
};

export function ActivityFeed() {
  const recent = [...mockInteractions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 9);

  return (
    <div className="glow-card gradient-border-top bg-noise rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Recent Activity
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground/35 uppercase tracking-widest">
            {recent.length} interactions
          </span>
        </div>
      </div>

      {/* Feed items */}
      <div className="divide-y divide-border/10">
        {recent.map((interaction) => {
          const config = TYPE_CONFIG[interaction.type];
          const Icon = config.icon;

          return (
            <div
              key={interaction.id}
              className="group/item relative flex items-start gap-4 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.015] cursor-default"
            >
              {/* Left edge color accent */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full opacity-0 group-hover/item:opacity-80 transition-opacity duration-200"
                style={{ background: config.edgeColor }}
              />

              {/* Icon */}
              <div
                className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-200 group-hover/item:scale-105"
                style={{ background: config.iconBg }}
              >
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {/* Top line: contact + type + deal */}
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mb-1">
                  <span className="text-[13px] font-semibold text-foreground/85">
                    {interaction.contactName}
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: config.edgeColor }}
                  >
                    {config.label}
                  </span>
                  {interaction.dealName && (
                    <span className="text-[11px] text-muted-foreground/40 truncate">
                      · {interaction.dealName}
                    </span>
                  )}
                  {interaction.duration != null && (
                    <span className="text-[10px] text-muted-foreground/35 font-mono">
                      {interaction.duration}min
                    </span>
                  )}
                </div>

                {/* Summary */}
                <p className="text-[12px] text-muted-foreground/60 leading-relaxed line-clamp-2 font-light">
                  {interaction.summary}
                </p>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-[10px] tabular-nums text-muted-foreground/35 whitespace-nowrap font-mono">
                  {relativeTime(interaction.date)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
