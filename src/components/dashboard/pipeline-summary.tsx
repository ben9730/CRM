"use client";

import { mockDeals, PIPELINE_STAGES } from "@/data/mock-deals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

const STAGE_COLORS = [
  "oklch(0.65 0.24 280 / 0.9)",  // Prospecting — full primary
  "oklch(0.65 0.24 280 / 0.75)", // Qualification
  "oklch(0.65 0.24 280 / 0.60)", // Proposal
  "oklch(0.65 0.24 280 / 0.45)", // Negotiation
  "oklch(0.70 0.18 150 / 0.80)", // Closed Won — green
  "oklch(0.55 0.15 30 / 0.60)",  // Closed Lost — muted red
];

export function PipelineSummary() {
  const stageData = PIPELINE_STAGES.map((stage, i) => {
    const deals = mockDeals.filter((d) => d.stage === stage);
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    return { stage, count: deals.length, value: totalValue, color: STAGE_COLORS[i] };
  });

  const maxValue = Math.max(...stageData.map((s) => s.value), 1);

  return (
    <Card className="border-border/40 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground/90">
          Pipeline by Stage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stageData.map(({ stage, count, value, color }) => (
          <div key={stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground/80">{stage}</span>
              <span className="text-muted-foreground">
                {count} deal{count !== 1 ? "s" : ""} · {formatCurrency(value)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: value === 0 ? "2px" : `${Math.max((value / maxValue) * 100, 3)}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
