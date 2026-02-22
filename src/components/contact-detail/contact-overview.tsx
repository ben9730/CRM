"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import type { ContactWithOrgs } from "@/lib/types/app";
import { deleteContact } from "@/lib/actions/contacts";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, ArrowLeft, Pencil, Trash2, Tag } from "lucide-react";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

// Deterministic avatar hue from name
function getAvatarHue(name: string): number {
  const hues = [280, 220, 160, 45, 320, 190];
  return hues[name.charCodeAt(0) % hues.length];
}

interface ContactOverviewProps {
  contact: ContactWithOrgs;
  onEditClick?: () => void;
}

export function ContactOverview({ contact, onEditClick }: ContactOverviewProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const hue = getAvatarHue(contact.first_name);
  const initials = getInitials(contact.first_name, contact.last_name);
  const primaryOrg = contact.organizations.find((o) => o.is_primary) ?? contact.organizations[0];
  const tags = contact.tags ?? [];

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteContact(contact.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Contact deleted");
        router.push("/contacts");
      }
    });
  }

  return (
    <>
      <div
        className="gradient-border-top rounded-xl overflow-hidden"
        style={{
          background: "oklch(0.13 0.005 280)",
          border: "1px solid oklch(1 0 0 / 7%)",
        }}
      >
        {/* Gradient mesh background */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
          aria-hidden="true"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 0% 0%, oklch(0.65 0.24 ${hue} / 7%) 0%, transparent 60%),
                         radial-gradient(ellipse 40% 40% at 100% 100%, oklch(0.55 0.20 280 / 5%) 0%, transparent 60%)`,
          }}
        />

        <div className="relative p-6">
          {/* Back link */}
          <Link
            href="/contacts"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-all duration-200 mb-6 px-3 py-1.5 rounded-md"
            style={{
              background: "oklch(0.16 0.005 280)",
              border: "1px solid oklch(1 0 0 / 8%)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "oklch(0.65 0.24 280 / 25%)";
              el.style.color = "oklch(0.85 0 0)";
              el.style.boxShadow = "0 0 12px -3px oklch(0.65 0.24 280 / 15%)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "oklch(1 0 0 / 8%)";
              el.style.color = "";
              el.style.boxShadow = "none";
            }}
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Contacts
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar with gradient ring */}
            <div className="flex-shrink-0">
              <div
                className="p-[2px] rounded-full"
                style={{
                  background: `conic-gradient(from 135deg, oklch(0.65 0.24 ${hue}), oklch(0.55 0.20 ${hue + 40}), oklch(0.65 0.24 ${hue}) 360deg)`,
                  boxShadow: `0 0 28px -4px oklch(0.65 0.24 ${hue} / 35%)`,
                }}
              >
                <div
                  className="h-[72px] w-[72px] rounded-full flex items-center justify-center text-2xl font-bold tracking-tight"
                  style={{
                    background: `oklch(0.12 0.02 ${hue})`,
                    color: `oklch(0.80 0.18 ${hue})`,
                  }}
                >
                  {initials}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1
                    className="text-3xl font-bold tracking-tight text-gradient-violet"
                    style={{ lineHeight: 1.2 }}
                  >
                    {fullName}
                  </h1>
                  {contact.title && (
                    <p className="text-sm font-medium text-foreground/70 mt-1">{contact.title}</p>
                  )}
                  {primaryOrg && (
                    <p
                      className="text-xs mt-0.5 font-medium"
                      style={{ color: `oklch(0.65 0.24 ${hue})` }}
                    >
                      {primaryOrg.name}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-7 px-2.5 border-border/40 bg-transparent hover:bg-white/5 hover:border-border/60"
                    onClick={onEditClick}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-7 px-2.5 bg-transparent"
                    style={{
                      borderColor: "oklch(0.55 0.22 25 / 30%)",
                      color: "oklch(0.55 0.22 25)",
                    }}
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Contact info pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{
                      background: "oklch(0.65 0.24 220 / 10%)",
                      border: "1px solid oklch(0.65 0.24 220 / 20%)",
                      color: "oklch(0.65 0.18 220)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "oklch(0.65 0.24 220 / 15%)";
                      el.style.borderColor = "oklch(0.65 0.24 220 / 35%)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "oklch(0.65 0.24 220 / 10%)";
                      el.style.borderColor = "oklch(0.65 0.24 220 / 20%)";
                    }}
                  >
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    {contact.email}
                  </a>
                )}

                {contact.phone && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "oklch(0.60 0.18 160 / 10%)",
                      border: "1px solid oklch(0.60 0.18 160 / 20%)",
                      color: "oklch(0.60 0.15 160)",
                    }}
                  >
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    {contact.phone}
                  </span>
                )}

                {contact.organizations.map((org) => (
                  <Link
                    key={org.id}
                    href={`/organizations/${org.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
                    style={{
                      background: `oklch(0.65 0.24 ${hue} / 8%)`,
                      border: `1px solid oklch(0.65 0.24 ${hue} / 18%)`,
                      color: `oklch(0.65 0.18 ${hue})`,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = `oklch(0.65 0.24 ${hue} / 14%)`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = `oklch(0.65 0.24 ${hue} / 8%)`;
                    }}
                  >
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    {org.name}
                    {org.is_primary && contact.organizations.length > 1 && (
                      <span className="opacity-60 text-[10px]">(primary)</span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Tag className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        background: "oklch(0.65 0.24 280 / 8%)",
                        border: "1px solid oklch(0.65 0.24 280 / 15%)",
                        color: "oklch(0.65 0.18 280)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete ${fullName}? This action soft-deletes the contact.`}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
