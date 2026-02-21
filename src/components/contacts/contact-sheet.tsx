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
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  ExternalLink,
  Tag,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { getAvatarGradient } from "./columns";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Tag color variants
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

interface ContactSheetProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSheet({ contact, open, onOpenChange }: ContactSheetProps) {
  if (!contact) return null;

  const gradient = getAvatarGradient(contact.name);
  const lastContactDate = new Date(contact.lastContact).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const now = new Date();
  const lastContactObj = new Date(contact.lastContact);
  const diffDays = Math.floor(
    (now.getTime() - lastContactObj.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isRecent = diffDays <= 7;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] p-0 overflow-y-auto border-l border-white/6"
        style={{ background: "oklch(0.10 0.003 280)" }}
      >
        {/* Dramatic gradient mesh header */}
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
              {/* Avatar with glow ring */}
              <div className="relative flex-shrink-0">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold ring-1 ring-white/15 shadow-[0_0_24px_oklch(0.65_0.24_280/20%)] ${gradient}`}
                >
                  {getInitials(contact.name)}
                </div>
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-full ring-1 ring-primary/20 scale-110 animate-pulse"
                  style={{ animationDuration: "3s" }}
                />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <SheetTitle className="text-xl font-bold text-left leading-tight text-gradient-violet">
                  {contact.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground/80 mt-1">
                  {contact.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3 w-3 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground/60">
                    {contact.organization}
                  </p>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4">
          {/* Active deals stat */}
          <div
            className="gradient-border-top rounded-lg p-4 relative overflow-hidden"
            style={{ background: "oklch(0.14 0.01 280)" }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 0% 0%, oklch(0.65 0.24 280 / 15%), transparent)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ background: "oklch(0.65 0.24 280 / 15%)" }}
                >
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Active Deals
                </span>
              </div>
              <p className="text-3xl font-bold text-gradient-violet">
                {contact.dealCount}
              </p>
            </div>
          </div>

          {/* Last contact stat */}
          <div
            className="gradient-border-top rounded-lg p-4 relative overflow-hidden"
            style={{ background: "oklch(0.14 0.01 280)" }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 0% 0%, oklch(0.55 0.20 150 / 10%), transparent)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{
                    background: isRecent
                      ? "oklch(0.55 0.18 150 / 15%)"
                      : "oklch(0.60 0 0 / 10%)",
                  }}
                >
                  <Clock
                    className={`h-3.5 w-3.5 ${
                      isRecent ? "text-emerald-400" : "text-muted-foreground/60"
                    }`}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Last Contact
                </span>
              </div>
              <p
                className={`text-sm font-bold leading-snug ${
                  isRecent ? "text-emerald-400" : "text-foreground/80"
                }`}
              >
                {lastContactDate}
              </p>
              {isRecent && (
                <p className="text-[10px] text-emerald-500/70 mt-0.5">
                  {diffDays === 0 ? "Today" : `${diffDays}d ago`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact info section */}
        <div className="px-6 pb-4 space-y-5">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
              Contact Info
            </h3>
            <div className="space-y-3">
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

              <div className="flex items-center gap-3">
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                  style={{ background: "oklch(0.55 0.15 150 / 10%)" }}
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-400/70" />
                </div>
                <span className="text-sm text-muted-foreground/70">
                  {contact.organization}
                </span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div
            className="h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(1 0 0 / 6%), transparent)",
            }}
          />

          {/* Tags section */}
          {contact.tags.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
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
              background: "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.50 0.25 300))",
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
