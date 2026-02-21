"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@/data/mock-contacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Gradient backgrounds keyed by first-char code mod 6
const AVATAR_GRADIENTS = [
  "from-violet-500/25 to-indigo-500/25 text-violet-300",
  "from-blue-500/25 to-cyan-500/25 text-blue-300",
  "from-emerald-500/25 to-teal-500/25 text-emerald-300",
  "from-amber-500/25 to-orange-500/25 text-amber-300",
  "from-rose-500/25 to-pink-500/25 text-rose-300",
  "from-cyan-500/25 to-sky-500/25 text-cyan-300",
];

export function getAvatarGradient(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

// Tag color variants for visual variety
const TAG_VARIANTS: Record<string, string> = {
  "decision-maker": "border-violet-500/30 text-violet-400 bg-violet-500/8",
  "champion": "border-indigo-500/30 text-indigo-400 bg-indigo-500/8",
  "c-suite": "border-amber-500/30 text-amber-400 bg-amber-500/8",
  "clinical": "border-emerald-500/30 text-emerald-400 bg-emerald-500/8",
  "technical": "border-cyan-500/30 text-cyan-400 bg-cyan-500/8",
  "finance": "border-blue-500/30 text-blue-400 bg-blue-500/8",
  "procurement": "border-orange-500/30 text-orange-400 bg-orange-500/8",
  "operations": "border-teal-500/30 text-teal-400 bg-teal-500/8",
  "strategy": "border-purple-500/30 text-purple-400 bg-purple-500/8",
  "influencer": "border-pink-500/30 text-pink-400 bg-pink-500/8",
  "end-user": "border-slate-500/30 text-slate-400 bg-slate-500/8",
  "budget-holder": "border-yellow-500/30 text-yellow-400 bg-yellow-500/8",
  "it-decision-maker": "border-blue-500/30 text-blue-400 bg-blue-500/8",
  "it": "border-sky-500/30 text-sky-400 bg-sky-500/8",
};

function getTagClass(tag: string): string {
  return TAG_VARIANTS[tag] ?? "border-white/10 text-muted-foreground bg-white/4";
}

interface SortHeaderProps {
  label: string;
  column: {
    toggleSorting: (asc: boolean) => void;
    getIsSorted: () => false | "asc" | "desc";
  };
  className?: string;
}

function SortHeader({ label, column, className }: SortHeaderProps) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`-ml-2 h-7 gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-foreground hover:bg-transparent px-2 ${className ?? ""}`}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="h-3 w-3 text-primary" />
      ) : sorted === "desc" ? (
        <ArrowDown className="h-3 w-3 text-primary" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </Button>
  );
}

export function createColumns(): ColumnDef<Contact>[] {
  return [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const name = row.original.name;
        const gradient = getAvatarGradient(name);
        return (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold ring-1 ring-white/10 ${gradient}`}
          >
            {getInitials(name)}
          </div>
        );
      },
      enableSorting: false,
      size: 48,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortHeader label="Name" column={column} />,
      cell: ({ row }) => (
        <span className="font-semibold text-sm text-foreground/95 tracking-tight">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "organization",
      header: ({ column }) => <SortHeader label="Organization" column={column} />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground/80">
          {row.getValue("organization")}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortHeader label="Title" column={column} className="hidden md:inline-flex" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground/70 hidden md:block">
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 hidden lg:block">
          Email
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground/60 hidden lg:block">
          {row.getValue("email")}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "tags",
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Tags
        </span>
      ),
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getTagClass(tag)}`}
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="inline-flex items-center rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] text-muted-foreground/60">
                +{tags.length - 2}
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "lastContact",
      header: ({ column }) => <SortHeader label="Last Contact" column={column} />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastContact") as string);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const isRecent = diffDays <= 7;
        return (
          <span className={`text-xs tabular-nums ${isRecent ? "text-emerald-400" : "text-muted-foreground/60"}`}>
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
  ];
}
