"use client";

import type { ContactWithOrgs } from "@/lib/types/app";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Building2,
  ExternalLink,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { getAvatarGradient, getTagClass } from "./columns";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

interface ContactSheetProps {
  contact: ContactWithOrgs | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSheet({ contact, open, onOpenChange }: ContactSheetProps) {
  if (!contact) return null;

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const gradient = getAvatarGradient(contact.first_name);
  const initials = getInitials(contact.first_name, contact.last_name);
  const primaryOrg =
    contact.organizations.find((o) => o.is_primary) ??
    contact.organizations[0];
  const tags = contact.tags ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] p-0 overflow-y-auto border-l border-white/6"
        style={{ background: "oklch(0.10 0.003 280)" }}
      >
        {/* Gradient mesh header */}
        <div
          className="relative overflow-hidden px-6 pt-8 pb-6"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.65 0.24 280 / 18%) 0%, transparent 70%), oklch(0.13 0.008 280)",
          }}
        >
          {/* Top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)",
            }}
          />

          <SheetHeader className="space-y-0">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold ring-1 ring-white/15 shadow-[0_0_24px_oklch(0.65_0.24_280/20%)] ${gradient}`}
                >
                  {initials}
                </div>
                <div
                  className="absolute inset-0 rounded-full ring-1 ring-primary/20 scale-110 animate-pulse"
                  style={{ animationDuration: "3s" }}
                />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <SheetTitle className="text-xl font-bold text-left leading-tight text-gradient-violet">
                  {fullName}
                </SheetTitle>
                {contact.title && (
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    {contact.title}
                  </p>
                )}
                {primaryOrg && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building2 className="h-3 w-3 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground/60">
                      {primaryOrg.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Contact info section */}
        <div className="px-6 pt-4 pb-4 space-y-4">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
              Contact Info
            </h3>
            <div className="space-y-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 group/link"
                >
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors"
                    style={{ background: "oklch(0.65 0.24 280 / 10%)" }}
                  >
                    <Mail className="h-3.5 w-3.5 text-primary/70 group-hover/link:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-mono text-muted-foreground/70 group-hover/link:text-primary transition-colors truncate">
                    {contact.email}
                  </span>
                </a>
              )}

              {contact.phone && (
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ background: "oklch(0.60 0.18 200 / 10%)" }}
                  >
                    <Phone className="h-3.5 w-3.5 text-blue-400/70" />
                  </div>
                  <span className="text-sm font-mono text-muted-foreground/70">
                    {contact.phone}
                  </span>
                </div>
              )}

              {contact.organizations.length > 0 && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ background: "oklch(0.55 0.15 150 / 10%)" }}
                  >
                    <Building2 className="h-3.5 w-3.5 text-emerald-400/70" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {contact.organizations.map((org) => (
                      <span key={org.id} className="text-sm text-muted-foreground/70">
                        {org.name}
                        {org.is_primary && (
                          <span className="ml-1.5 text-[10px] text-primary/60">(primary)</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div
                className="h-px mb-4"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(1 0 0 / 6%), transparent)",
                }}
              />
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getTagClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div
          className="sticky bottom-0 px-6 py-4 border-t border-white/6"
          style={{ background: "oklch(0.10 0.003 280 / 95%)" }}
        >
          <Button
            asChild
            className="w-full gap-2 font-semibold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.50 0.25 300))",
              boxShadow: "0 0 20px -5px oklch(0.65 0.24 280 / 30%)",
            }}
          >
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
