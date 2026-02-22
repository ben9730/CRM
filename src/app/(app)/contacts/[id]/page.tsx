"use client";

import { use } from "react";
import { mockContacts } from "@/data/mock-contacts";
import { mockDeals } from "@/data/mock-deals";
import { mockTasks } from "@/data/mock-tasks";
import { mockInteractions } from "@/data/mock-interactions";
import { ContactOverview } from "@/components/contact-detail/contact-overview";
import { LinkedDeals } from "@/components/contact-detail/linked-deals";
import { LinkedTasks } from "@/components/contact-detail/linked-tasks";
import { InteractionTimeline } from "@/components/contact-detail/interaction-timeline";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = use(params);

  const contact = mockContacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
        {/* Ambient glow */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 30%, oklch(0.65 0.24 280 / 4%) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center space-y-3">
          <div
            className="text-6xl font-bold tracking-tighter"
            style={{
              background: "linear-gradient(135deg, oklch(0.75 0.20 280), oklch(0.60 0.28 300))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground/90">Contact not found</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            No contact exists with ID{" "}
            <code
              className="font-mono text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "oklch(0.18 0.02 280)",
                color: "oklch(0.65 0.24 280)",
                border: "1px solid oklch(0.65 0.24 280 / 20%)",
              }}
            >
              {id}
            </code>
          </p>
        </div>
        <Link
          href="/contacts"
          className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground"
          style={{
            background: "oklch(0.14 0 0)",
            border: "1px solid oklch(1 0 0 / 8%)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "oklch(0.65 0.24 280 / 25%)";
            e.currentTarget.style.boxShadow = "0 0 16px -4px oklch(0.65 0.24 280 / 15%)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "oklch(1 0 0 / 8%)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Contacts
        </Link>
      </div>
    );
  }

  const linkedDeals = mockDeals.filter((d) => d.contactId === id);
  const linkedTasks = mockTasks.filter((t) => t.contactId === id);
  const linkedInteractions = mockInteractions.filter((i) => i.contactId === id);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Ambient background gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.65 0.24 280 / 5%) 0%, transparent 60%)",
        }}
      />

      {/* Contact overview */}
      <div className="animate-fade-in relative z-10">
        <ContactOverview contact={contact} />
      </div>

      {/* Middle section: Linked entities */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 animate-fade-in animate-delay-2 relative z-10">
        <LinkedDeals deals={linkedDeals} />
        <LinkedTasks tasks={linkedTasks} />
      </div>

      {/* Interaction timeline */}
      <div className="animate-fade-in animate-delay-3 relative z-10">
        <InteractionTimeline interactions={linkedInteractions} />
      </div>
    </div>
  );
}
