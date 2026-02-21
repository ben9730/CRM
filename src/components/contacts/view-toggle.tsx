"use client";

import { LayoutList, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "table" | "grid";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-border/40 overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none border-r border-border/40 h-8 px-3 transition-colors ${
          view === "table"
            ? "bg-primary/15 text-primary hover:bg-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        }`}
        onClick={() => onChange("table")}
        title="Table view"
      >
        <LayoutList className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none h-8 px-3 transition-colors ${
          view === "grid"
            ? "bg-primary/15 text-primary hover:bg-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        }`}
        onClick={() => onChange("grid")}
        title="Grid view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
