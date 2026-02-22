"use client";

import { useState } from "react";
import { mockContacts, Contact } from "@/data/mock-contacts";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { ContactsGrid } from "@/components/contacts/contacts-grid";
import { ViewToggle, ViewMode } from "@/components/contacts/view-toggle";
import { ContactSheet } from "@/components/contacts/contact-sheet";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";

export default function ContactsPage() {
  const [view, setView] = useState<ViewMode>("table");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleContactSelect(contact: Contact) {
    setSelectedContact(contact);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div className="flex items-start gap-3">
          {/* Icon accent */}
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.24 280 / 20%), oklch(0.55 0.24 300 / 20%))",
              boxShadow: "0 0 16px -4px oklch(0.65 0.24 280 / 20%)",
              border: "1px solid oklch(0.65 0.24 280 / 15%)",
            }}
          >
            <Users className="h-5 w-5 text-primary/80" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient-violet">
              Contacts
            </h1>
            <p className="text-sm text-muted-foreground/60 mt-0.5">
              {mockContacts.length} healthcare B2B contacts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <Button
            size="sm"
            className="gap-1.5 font-medium"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.50 0.25 300))",
              boxShadow: "0 0 16px -4px oklch(0.65 0.24 280 / 25%)",
              border: "1px solid oklch(0.65 0.24 280 / 20%)",
            }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Gradient separator */}
      <div
        className="h-px animate-fade-in animate-delay-1"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.65 0.24 280 / 20%), oklch(0.65 0.24 280 / 5%), transparent)",
        }}
      />

      {/* Content */}
      <div className="animate-fade-in animate-delay-2">
        {view === "table" ? (
          <ContactsTable
            contacts={mockContacts}
            onRowClick={handleContactSelect}
          />
        ) : (
          <ContactsGrid
            contacts={mockContacts}
            onCardClick={handleContactSelect}
          />
        )}
      </div>

      {/* Slide-over sheet */}
      <ContactSheet
        contact={selectedContact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
