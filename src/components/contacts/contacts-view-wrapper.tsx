'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContactWithOrgs } from '@/lib/types/app'
import { ContactsTable } from './contacts-table'
import { ContactsGrid } from './contacts-grid'
import { ContactSheet } from './contact-sheet'
import { ViewToggle, ViewMode } from './view-toggle'

interface ContactsViewWrapperProps {
  contacts: ContactWithOrgs[]
}

export function ContactsViewWrapper({ contacts }: ContactsViewWrapperProps) {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>('table')
  const [selectedContact, setSelectedContact] = useState<ContactWithOrgs | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleContactSelect(contact: ContactWithOrgs) {
    setSelectedContact(contact)
    setSheetOpen(true)
  }

  return (
    <>
      {/* View toggle header */}
      <div className="flex items-center justify-between mb-4">
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Content */}
      {view === 'table' ? (
        <ContactsTable contacts={contacts} onRowClick={handleContactSelect} />
      ) : (
        <ContactsGrid contacts={contacts} onCardClick={handleContactSelect} />
      )}

      {/* Slide-over sheet (quick preview) */}
      <ContactSheet
        contact={selectedContact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
