"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactWithOrgs } from "@/lib/types/app";
import { createColumns } from "./columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContactsTableProps {
  contacts: ContactWithOrgs[];
  onRowClick?: (contact: ContactWithOrgs) => void;
}

export function ContactsTable({ contacts, onRowClick }: ContactsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = createColumns();

  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleRowClick(contact: ContactWithOrgs) {
    if (onRowClick) {
      onRowClick(contact);
    } else {
      router.push(`/contacts/${contact.id}`);
    }
  }

  return (
    <div
      className="rounded-xl border border-white/6 overflow-x-auto animate-fade-in"
      style={{ background: "oklch(0.13 0.005 280)" }}
    >
      {/* Gradient top accent */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 35%), transparent)",
        }}
      />
      <Table className="min-w-[680px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-white/6 hover:bg-transparent"
              style={{ background: "oklch(0.11 0.003 280 / 80%)" }}
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-3 py-2.5 h-10"
                  style={{
                    width:
                      header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-16 text-muted-foreground/60 text-sm"
              >
                No contacts found
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer border-b border-white/4 transition-all duration-150 group"
                onClick={() => handleRowClick(row.original)}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "oklch(0.22 0.04 280 / 30%)";
                  el.style.boxShadow = "inset 2px 0 0 oklch(0.65 0.24 280)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "transparent";
                  el.style.boxShadow = "none";
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Bottom fade */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 10%), transparent)",
        }}
      />
    </div>
  );
}
