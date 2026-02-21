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
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Contact not found</h1>
          <p className="text-muted-foreground mt-2">
            No contact exists with ID <code className="font-mono text-sm bg-muted/30 px-1.5 py-0.5 rounded">{id}</code>
          </p>
        </div>
        <Link
          href="/contacts"
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
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
      {/* Contact overview */}
      <ContactOverview contact={contact} />

      {/* Middle section: Linked entities */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LinkedDeals deals={linkedDeals} />
        <LinkedTasks tasks={linkedTasks} />
      </div>

      {/* Interaction timeline */}
      <InteractionTimeline interactions={linkedInteractions} />
    </div>
  );
}
