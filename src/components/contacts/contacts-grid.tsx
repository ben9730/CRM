"use client";

import { useRouter } from "next/navigation";
import type { ContactWithOrgs } from "@/lib/types/app";
import { getAvatarGradient, getTagClass } from "./columns";
import { Building2, Briefcase } from "lucide-react";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

const DELAY_CLASSES = [
  "",
  "animate-delay-1",
  "animate-delay-2",
  "animate-delay-3",
  "animate-delay-4",
];

interface ContactsGridProps {
  contacts: ContactWithOrgs[];
  onCardClick?: (contact: ContactWithOrgs) => void;
}

export function ContactsGrid({ contacts, onCardClick }: ContactsGridProps) {
  const router = useRouter();

  function handleClick(contact: ContactWithOrgs) {
    if (onCardClick) {
      onCardClick(contact);
    } else {
      router.push(`/contacts/${contact.id}`);
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-sm text-muted-foreground">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact, idx) => {
        const gradient = getAvatarGradient(contact.first_name);
        const initials = getInitials(contact.first_name, contact.last_name);
        const delayClass = DELAY_CLASSES[idx % DELAY_CLASSES.length];
        const primaryOrg = contact.organizations.find((o) => o.is_primary) ?? contact.organizations[0];
        const tags = contact.tags ?? [];

        return (
          <div
            key={contact.id}
            onClick={() => handleClick(contact)}
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
                  {initials}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-foreground/95 truncate tracking-tight group-hover:text-gradient-violet transition-all duration-200">
                  {contact.first_name} {contact.last_name}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                  {contact.title ?? ""}
                </p>
              </div>
            </div>

            {/* Organization */}
            {primaryOrg && (
              <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                <Building2 className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                <p className="text-xs text-muted-foreground/60 truncate">
                  {primaryOrg.name}
                </p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getTagClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="inline-flex items-center rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] text-muted-foreground/50">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer: org count */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/60">
                  <span className="font-semibold text-foreground/80">
                    {contact.organizations.length}
                  </span>{" "}
                  {contact.organizations.length === 1 ? "org" : "orgs"}
                </span>
              </div>
              {contact.email && (
                <span className="text-[10px] text-muted-foreground/40 font-mono truncate max-w-[120px]">
                  {contact.email}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
