"use client";

import { KanbanBoard } from "@/components/deals/kanban-board";
import { Button } from "@/components/ui/button";
import { mockDeals } from "@/data/mock-deals";
import { Plus, TrendingUp } from "lucide-react";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export default function DealsPage() {
  const totalPipelineValue = mockDeals
    .filter((d) => d.stage !== "Closed Lost")
    .reduce((sum, d) => sum + d.value, 0);

  const activeDeals = mockDeals.filter(
    (d) => d.stage !== "Closed Lost" && d.stage !== "Closed Won"
  ).length;

  const wonDeals = mockDeals.filter((d) => d.stage === "Closed Won").length;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Page header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-border/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Deal Pipeline
              </h1>
            </div>
            <div className="flex items-center gap-4 pl-10">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Pipeline value:</span>
                <span className="text-gradient-violet font-bold text-sm">
                  {formatCurrency(totalPipelineValue)}
                </span>
              </div>
              <div className="h-3 w-px bg-border/60" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground/70 font-medium">{activeDeals}</span> active
              </span>
              <div className="h-3 w-px bg-border/60" />
              <span className="text-xs text-muted-foreground">
                <span className="text-emerald-400 font-medium">{wonDeals}</span> won
              </span>
            </div>
          </div>

          <Button
            size="sm"
            className="gap-1.5 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-primary/30 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
