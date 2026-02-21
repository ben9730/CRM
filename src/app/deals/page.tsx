"use client";

import { KanbanBoard } from "@/components/deals/kanban-board";
import { Button } from "@/components/ui/button";
import { mockDeals } from "@/data/mock-deals";
import { Plus } from "lucide-react";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export default function DealsPage() {
  const totalPipelineValue = mockDeals
    .filter((d) => d.stage !== "Closed Lost")
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total pipeline:{" "}
            <span className="text-foreground font-semibold">
              {formatCurrency(totalPipelineValue)}
            </span>
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Deal
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}
