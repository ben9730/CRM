"use client";

import { mockInteractions } from "@/data/mock-interactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_CONFIG = {
  call: { icon: Phone, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  email: { icon: Mail, color: "text-blue-400", bg: "bg-blue-400/10" },
  meeting: { icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
  note: { icon: FileText, color: "text-amber-400", bg: "bg-amber-400/10" },
};

export function ActivityFeed() {
  const recent = [...mockInteractions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 9);

  return (
    <Card className="border-border/40 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground/90">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {recent.map((interaction, idx) => {
          const config = TYPE_CONFIG[interaction.type];
          const Icon = config.icon;
          return (
            <div
              key={interaction.id}
              className={`flex items-start gap-3 py-3 ${
                idx !== recent.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <div className={`flex-shrink-0 rounded-md p-1.5 ${config.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-foreground/90">
                    {interaction.contactName}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    · {interaction.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {interaction.summary}
                </p>
              </div>
              <span className="flex-shrink-0 text-[10px] text-muted-foreground/60 mt-0.5 whitespace-nowrap">
                {relativeTime(interaction.date)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
