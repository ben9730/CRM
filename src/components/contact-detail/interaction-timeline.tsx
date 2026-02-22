"use client";

import { Phone, Mail, Calendar, FileText, Clock } from "lucide-react";

const TYPE_CONFIG: Record<
  string,
  {
    Icon: React.ElementType;
    accentOklch: string;
    bgOklch: string;
    borderOklch: string;
    label: string;
  }
> = {
  call: {
    Icon: Phone,
    accentOklch: "oklch(0.65 0.18 150)",
    bgOklch: "oklch(0.65 0.18 150 / 10%)",
    borderOklch: "oklch(0.65 0.18 150 / 25%)",
    label: "Call",
  },
  email: {
    Icon: Mail,
    accentOklch: "oklch(0.60 0.20 220)",
    bgOklch: "oklch(0.60 0.20 220 / 10%)",
    borderOklch: "oklch(0.60 0.20 220 / 25%)",
    label: "Email",
  },
  meeting: {
    Icon: Calendar,
    accentOklch: "oklch(0.65 0.24 280)",
    bgOklch: "oklch(0.65 0.24 280 / 10%)",
    borderOklch: "oklch(0.65 0.24 280 / 25%)",
    label: "Meeting",
  },
  note: {
    Icon: FileText,
    accentOklch: "oklch(0.70 0.20 65)",
    bgOklch: "oklch(0.70 0.20 65 / 10%)",
    borderOklch: "oklch(0.70 0.20 65 / 25%)",
    label: "Note",
  },
};

const DEFAULT_TYPE_CONFIG = {
  Icon: FileText,
  accentOklch: "oklch(0.55 0 0)",
  bgOklch: "oklch(0.18 0 0)",
  borderOklch: "oklch(1 0 0 / 12%)",
  label: "Interaction",
};

export interface ContactInteraction {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  occurred_at: string;
  duration_mins: number | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) return `Today · ${timeStr}`;
  if (diffDays === 1) return `Yesterday · ${timeStr}`;
  if (diffDays < 7) return `${diffDays}d ago · ${timeStr}`;

  return (
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) + ` · ${timeStr}`
  );
}

interface InteractionTimelineProps {
  interactions: ContactInteraction[];
}

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  const sorted = [...interactions].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  );

  return (
    <div
      className="gradient-border-top rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.13 0.005 280)",
        border: "1px solid oklch(1 0 0 / 7%)",
      }}
    >
      {/* Section header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 5%)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{
                background: "oklch(0.60 0.24 300 / 12%)",
                border: "1px solid oklch(0.60 0.24 300 / 20%)",
              }}
            >
              <Clock
                className="h-3.5 w-3.5"
                style={{ color: "oklch(0.60 0.24 300)" }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground/90">
              Interaction Timeline
            </span>
          </div>
          <span
            className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[10px] font-bold tabular-nums"
            style={{
              background: "oklch(0.60 0.24 300 / 12%)",
              color: "oklch(0.60 0.24 300)",
              border: "1px solid oklch(0.60 0.24 300 / 20%)",
            }}
          >
            {interactions.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.60 0.24 300 / 5%)",
                border: "1px solid oklch(0.60 0.24 300 / 10%)",
              }}
            >
              <Clock
                className="h-5 w-5"
                style={{ color: "oklch(0.60 0.24 300 / 30%)" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              No interactions recorded
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Gradient timeline line */}
            <div
              className="absolute left-[17px] top-4 z-0"
              style={{
                width: "2px",
                bottom: "8px",
                background:
                  "linear-gradient(to bottom, oklch(0.65 0.24 280 / 50%), oklch(0.65 0.24 280 / 20%) 60%, transparent 100%)",
              }}
            />

            <div className="space-y-0">
              {sorted.map((interaction, index) => {
                const cfg = TYPE_CONFIG[interaction.type] ?? DEFAULT_TYPE_CONFIG;
                const { Icon } = cfg;
                const displayText = interaction.subject || interaction.body || `${cfg.label} recorded`;

                return (
                  <div
                    key={interaction.id}
                    className="relative flex gap-4 group"
                    style={{ paddingBottom: index < sorted.length - 1 ? "20px" : "0" }}
                  >
                    {/* Icon node */}
                    <div
                      className="relative z-10 flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
                      style={{
                        background: cfg.bgOklch,
                        border: `1.5px solid ${cfg.borderOklch}`,
                        boxShadow: `0 0 0 4px oklch(0.13 0.005 280)`,
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: cfg.accentOklch }}
                      />
                    </div>

                    {/* Content card */}
                    <div
                      className="flex-1 min-w-0 rounded-lg overflow-hidden transition-all duration-200 group-hover:border-opacity-100"
                      style={{
                        background: "oklch(0.15 0.003 280)",
                        border: "1px solid oklch(1 0 0 / 6%)",
                        marginTop: "2px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          cfg.borderOklch;
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          `0 0 16px -4px ${cfg.accentOklch} / 12%`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "oklch(1 0 0 / 6%)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                      }}
                    >
                      {/* Top accent strip */}
                      <div
                        className="h-[2px] w-full"
                        style={{
                          background: `linear-gradient(90deg, ${cfg.accentOklch}, transparent)`,
                          opacity: 0.4,
                        }}
                      />

                      <div className="px-4 py-3">
                        {/* Header row */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                            style={{
                              background: cfg.bgOklch,
                              color: cfg.accentOklch,
                              border: `1px solid ${cfg.borderOklch}`,
                            }}
                          >
                            {cfg.label}
                          </span>

                          {interaction.duration_mins && (
                            <span
                              className="flex items-center gap-1 text-[10px] font-medium"
                              style={{ color: "oklch(0.45 0 0)" }}
                            >
                              <Clock className="h-2.5 w-2.5" />
                              {interaction.duration_mins} min
                            </span>
                          )}

                          <span
                            className="ml-auto text-[10px] font-medium tabular-nums flex-shrink-0"
                            style={{ color: "oklch(0.42 0 0)" }}
                          >
                            {formatDate(interaction.occurred_at)}
                          </span>
                        </div>

                        {/* Content */}
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "oklch(0.70 0 0)" }}
                        >
                          {displayText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
