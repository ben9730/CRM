"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "@/data/mock-deals";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface DealCardProps {
  deal: Deal;
  isOverlay?: boolean;
}

export function DealCard({ deal, isOverlay = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        rounded-md border bg-background/70 p-3 select-none
        ${isDragging ? "opacity-40 shadow-lg ring-1 ring-primary/50" : ""}
        ${isOverlay ? "rotate-1 shadow-xl ring-1 ring-primary/30 cursor-grabbing" : "cursor-grab hover:bg-background hover:shadow-sm"}
        border-border/50 transition-all
      `}
    >
      <p className="text-sm font-medium leading-snug text-foreground/90 line-clamp-2">
        {deal.name}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {deal.organizationName}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-foreground/80">
        {formatCurrency(deal.value)}
      </p>
    </div>
  );
}
