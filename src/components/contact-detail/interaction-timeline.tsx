"use client";

import { Interaction } from "@/data/mock-interactions";
import { Phone, Mail, Calendar, FileText } from "lucide-react";

const TYPE_CONFIG = {
  call: { icon: Phone, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  email: { icon: Mail, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  meeting: { icon: Calendar, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  note: { icon: FileText, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface InteractionTimelineProps {
  interactions: Interaction[];
}

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  const sorted = [...interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-5">
      <h2 className="text-sm font-semibold text-foreground/90 mb-5">
        Interaction Timeline
      </h2>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
            <Calendar className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No interactions recorded</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-5 bottom-0 w-px bg-border/40" />

          <div className="space-y-5">
            {sorted.map((interaction) => {
              const config = TYPE_CONFIG[interaction.type];
              const Icon = config.icon;
              return (
                <div key={interaction.id} className="relative flex gap-4 pl-0">
                  {/* Icon node */}
                  <div
                    className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${config.bg}`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold capitalize text-foreground/80">
                        {interaction.type}
                      </span>
                      {interaction.duration && (
                        <span className="text-xs text-muted-foreground">
                          · {interaction.duration} min
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                        {formatDate(interaction.date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {interaction.summary}
                    </p>
                    {interaction.dealName && (
                      <p className="mt-1.5 text-xs text-primary/70">
                        re: {interaction.dealName}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
