"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@/data/mock-contacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-blue-500/20 text-blue-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
  "bg-cyan-500/20 text-cyan-400",
];

function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function createColumns(): ColumnDef<Contact>[] {
  return [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const name = row.original.name;
        const colorClass = getAvatarColor(name);
        return (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${colorClass}`}
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-7 gap-1 text-xs font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "organization",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-7 gap-1 text-xs font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("organization")}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-7 gap-1 text-xs font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: () => <span className="text-xs font-medium">Email</span>,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-mono text-xs">
          {row.getValue("email")}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "tags",
      header: () => <span className="text-xs font-medium">Tags</span>,
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 border-border/50 text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 border-border/50 text-muted-foreground"
              >
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "lastContact",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-7 gap-1 text-xs font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Contact
          <ArrowUpDown className="h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastContact") as string);
        return (
          <span className="text-sm text-muted-foreground">
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
