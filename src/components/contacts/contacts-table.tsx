"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import { useState } from "react";
import { Contact } from "@/data/mock-contacts";
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
  contacts: Contact[];
  onRowClick: (contact: Contact) => void;
}

export function ContactsTable({ contacts, onRowClick }: ContactsTableProps) {
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

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-border/40 bg-muted/20 hover:bg-muted/20"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-medium text-muted-foreground px-3 py-2.5"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, idx) => (
            <TableRow
              key={row.id}
              className={`cursor-pointer border-b border-border/30 transition-colors hover:bg-accent/40 ${
                idx % 2 === 0 ? "bg-card/20" : "bg-card/5"
              }`}
              onClick={() => onRowClick(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-3 py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
