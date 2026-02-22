import { Phone, Mail, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import type { InteractionWithRelations } from "@/lib/types/app";

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

const TYPE_CONFIG: Record<string, TypeConfig> = {
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

const DEFAULT_CONFIG: TypeConfig = {
  icon: FileText,
  color: "text-muted-foreground/60",
  iconBg: "oklch(0.18 0 0)",
  edgeColor: "oklch(0.40 0 0)",
  label: "Interaction",
};

interface ActivityFeedProps {
  recentActivity: InteractionWithRelations[];
}

export function ActivityFeed({ recentActivity }: ActivityFeedProps) {
  return (
    <div className="glow-card gradient-border-top bg-noise rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Recent Activity
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground/35 uppercase tracking-widest">
            {recentActivity.length} interaction{recentActivity.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Feed items */}
      {recentActivity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <FileText className="h-7 w-7 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground/40">No recent activity.</p>
          <p className="text-xs text-muted-foreground/30">
            Log an interaction to see it here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/10">
          {recentActivity.map((interaction) => {
            const config = TYPE_CONFIG[interaction.type] ?? DEFAULT_CONFIG;
            const Icon = config.icon;
            const contactName = interaction.contacts
              ? `${interaction.contacts.first_name} ${interaction.contacts.last_name}`
              : null;
            const dealTitle = interaction.deals?.title ?? null;
            const displayText =
              interaction.subject || interaction.body?.slice(0, 120) || null;

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
                    {contactName ? (
                      <Link
                        href={`/contacts/${interaction.contact_id}`}
                        className="text-[13px] font-semibold text-foreground/85 hover:text-primary/80 transition-colors"
                      >
                        {contactName}
                      </Link>
                    ) : (
                      <span className="text-[13px] font-semibold text-foreground/60">
                        Unknown contact
                      </span>
                    )}
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: config.edgeColor }}
                    >
                      {config.label}
                    </span>
                    {dealTitle && interaction.deal_id && (
                      <Link
                        href={`/deals/${interaction.deal_id}`}
                        className="text-[11px] text-muted-foreground/40 truncate hover:text-muted-foreground/70 transition-colors"
                      >
                        · {dealTitle}
                      </Link>
                    )}
                    {interaction.duration_mins != null && (
                      <span className="text-[10px] text-muted-foreground/35 font-mono">
                        {interaction.duration_mins}min
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  {displayText && (
                    <p className="text-[12px] text-muted-foreground/60 leading-relaxed line-clamp-2 font-light">
                      {displayText}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-[10px] tabular-nums text-muted-foreground/35 whitespace-nowrap font-mono">
                    {relativeTime(interaction.occurred_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
