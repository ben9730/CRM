"use client";

import { Contact } from "@/data/mock-contacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

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

interface ContactOverviewProps {
  contact: Contact;
}

export function ContactOverview({ contact }: ContactOverviewProps) {
  const colorClass = getAvatarColor(contact.name);

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-6">
      {/* Back link */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Contacts
      </Link>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div
          className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold ${colorClass}`}
        >
          {getInitials(contact.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{contact.name}</h1>
              <p className="text-muted-foreground mt-0.5">{contact.title}</p>
              <p className="text-muted-foreground text-sm">{contact.organization}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled>
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" disabled>
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>

          {/* Contact info row */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              {contact.email}
            </a>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              {contact.phone}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              {contact.organization}
            </span>
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs border-border/50 text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
