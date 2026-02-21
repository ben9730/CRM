"use client";

import { Deal } from "@/data/mock-deals";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const STAGE_COLORS: Record<string, string> = {
  Prospecting: "bg-muted/50 text-muted-foreground border-border/50",
  Qualification: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Proposal: "bg-primary/15 text-primary border-primary/30",
  Negotiation: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Closed Won": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Closed Lost": "bg-destructive/15 text-destructive border-destructive/30",
};

interface LinkedDealsProps {
  deals: Deal[];
}

export function LinkedDeals({ deals }: LinkedDealsProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-5">
      <h2 className="text-sm font-semibold text-foreground/90 mb-4 flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
        Linked Deals
        <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 h-4 border-border/50 text-muted-foreground">
          {deals.length}
        </Badge>
      </h2>

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
            <Briefcase className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No linked deals</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/50 px-3.5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{deal.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Close: {new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold">{formatCurrency(deal.value)}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-4 border whitespace-nowrap ${STAGE_COLORS[deal.stage] ?? ""}`}
                >
                  {deal.stage}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
