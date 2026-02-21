"use client";

import { Contact } from "@/data/mock-contacts";
import { Badge } from "@/components/ui/badge";

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

interface ContactsGridProps {
  contacts: Contact[];
  onCardClick: (contact: Contact) => void;
}

export function ContactsGrid({ contacts, onCardClick }: ContactsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => {
        const colorClass = getAvatarColor(contact.name);
        return (
          <div
            key={contact.id}
            onClick={() => onCardClick(contact)}
            className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border/40 bg-card/60 p-5 transition-all hover:bg-card/90 hover:border-border/70 hover:shadow-md"
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorClass}`}
              >
                {getInitials(contact.name)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {contact.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {contact.title}
                </p>
              </div>
            </div>

            {/* Organization */}
            <p className="text-xs text-muted-foreground border-t border-border/30 pt-2.5 truncate">
              {contact.organization}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 border-border/50 text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 border-border/50 text-muted-foreground"
                >
                  +{contact.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
