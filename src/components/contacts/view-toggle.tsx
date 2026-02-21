"use client";

import { LayoutList, LayoutGrid } from "lucide-react";

export type ViewMode = "table" | "grid";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-white/8 overflow-hidden bg-white/3 backdrop-blur-sm">
      <button
        className={`flex h-8 w-9 items-center justify-center border-r border-white/8 transition-all duration-200 ${
          view === "table"
            ? "bg-primary/20 text-primary shadow-[inset_0_1px_0_oklch(0.65_0.24_280/15%)]"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
        onClick={() => onChange("table")}
        title="Table view"
        aria-label="Table view"
      >
        <LayoutList className="h-3.5 w-3.5" />
      </button>
      <button
        className={`flex h-8 w-9 items-center justify-center transition-all duration-200 ${
          view === "grid"
            ? "bg-primary/20 text-primary shadow-[inset_0_1px_0_oklch(0.65_0.24_280/15%)]"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
        onClick={() => onChange("grid")}
        title="Grid view"
        aria-label="Grid view"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
