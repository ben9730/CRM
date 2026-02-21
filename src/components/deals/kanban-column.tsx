"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Deal } from "@/data/mock-deals";
import { DealCard } from "./deal-card";
import { Badge } from "@/components/ui/badge";

function formatCurrency(value: number): string {
  if (value === 0) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

interface KanbanColumnProps {
  stage: string;
  deals: Deal[];
}

export function KanbanColumn({ stage, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex w-70 flex-shrink-0 flex-col rounded-xl border border-border/40 bg-card/50 overflow-hidden"
      style={{ width: "280px" }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-border/40 px-3.5 py-3 bg-card/80">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground/90">{stage}</span>
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 border-border/50 text-muted-foreground"
          >
            {deals.length}
          </Badge>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {formatCurrency(totalValue)}
        </span>
      </div>

      {/* Cards list */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 p-2.5 min-h-[200px] flex-1 transition-colors ${
          isOver ? "bg-primary/5" : ""
        }`}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-8 text-xs text-muted-foreground/50 select-none">
            <div className="h-8 w-8 rounded-full border-2 border-dashed border-border/40 mb-2" />
            No deals
          </div>
        )}
      </div>
    </div>
  );
}
