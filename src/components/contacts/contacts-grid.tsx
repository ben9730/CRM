"use client";

import { Contact } from "@/data/mock-contacts";
import { getAvatarGradient } from "./columns";
import { Building2, Briefcase } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

const DELAY_CLASSES = [
  "",
  "animate-delay-1",
  "animate-delay-2",
  "animate-delay-3",
  "animate-delay-4",
];

interface ContactsGridProps {
  contacts: Contact[];
  onCardClick: (contact: Contact) => void;
}

export function ContactsGrid({ contacts, onCardClick }: ContactsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact, idx) => {
        const gradient = getAvatarGradient(contact.name);
        const delayClass = DELAY_CLASSES[idx % DELAY_CLASSES.length];
        const lastDate = new Date(contact.lastContact).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={contact.id}
            onClick={() => onCardClick(contact)}
            className={`glow-card animate-fade-in ${delayClass} group cursor-pointer rounded-xl p-5 flex flex-col gap-4`}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)",
              }}
            />

            {/* Avatar + Name row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold ring-1 ring-white/10 transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/30 group-hover:shadow-[0_0_12px_oklch(0.65_0.24_280/20%)] ${gradient}`}
                >
                  {getInitials(contact.name)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground/95 truncate tracking-tight group-hover:text-gradient-violet transition-all duration-200">
                  {contact.name}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                  {contact.title}
                </p>
              </div>
            </div>

            {/* Organization */}
            <div className="flex items-center gap-2 border-t border-white/5 pt-3">
              <Building2 className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
              <p className="text-xs text-muted-foreground/60 truncate">
                {contact.organization}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getTagClass(tag)}`}
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length > 3 && (
                <span className="inline-flex items-center rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] text-muted-foreground/50">
                  +{contact.tags.length - 3}
                </span>
              )}
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/60">
                  <span className="font-semibold text-foreground/80">
                    {contact.dealCount}
                  </span>{" "}
                  {contact.dealCount === 1 ? "deal" : "deals"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                {lastDate}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
