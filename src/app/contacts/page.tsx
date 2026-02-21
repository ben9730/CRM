"use client";

import { useState } from "react";
import { mockContacts, Contact } from "@/data/mock-contacts";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { ContactsGrid } from "@/components/contacts/contacts-grid";
import { ViewToggle, ViewMode } from "@/components/contacts/view-toggle";
import { ContactSheet } from "@/components/contacts/contact-sheet";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockContacts.length} healthcare B2B contacts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <Button size="sm" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Content */}
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

      {/* Slide-over sheet */}
      <ContactSheet
        contact={selectedContact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
