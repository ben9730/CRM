"use client";

import { Contact } from "@/data/mock-contacts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Calendar, Briefcase, ExternalLink } from "lucide-react";
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

interface ContactSheetProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSheet({ contact, open, onOpenChange }: ContactSheetProps) {
  if (!contact) return null;

  const colorClass = getAvatarColor(contact.name);
  const lastContactDate = new Date(contact.lastContact).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[480px] bg-card border-border/50 p-0 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border/40">
          <SheetHeader className="space-y-0">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${colorClass}`}
              >
                {getInitials(contact.name)}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-bold text-left leading-tight">
                  {contact.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{contact.title}</p>
                <p className="text-sm text-muted-foreground">{contact.organization}</p>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Contact details */}
        <div className="p-6 space-y-4">
          {/* Contact info */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Info
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-primary hover:underline truncate"
                >
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground/90">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground/90">{contact.organization}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Active Deals</span>
              </div>
              <p className="text-xl font-bold">{contact.dealCount}</p>
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Last Contact</span>
              </div>
              <p className="text-xs font-semibold leading-tight">{lastContactDate}</p>
            </div>
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
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
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="p-6 pt-0">
          <Button asChild className="w-full gap-2" variant="outline">
            <Link href={`/contacts/${contact.id}`} onClick={() => onOpenChange(false)}>
              <ExternalLink className="h-3.5 w-3.5" />
              Open Full Profile
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
