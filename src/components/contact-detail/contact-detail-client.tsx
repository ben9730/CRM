'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContactWithOrgs, InteractionWithRelations, TaskWithRelations } from '@/lib/types/app'
import type { ContactDeal } from './linked-deals'
import { ContactOverview } from './contact-overview'
import { LinkedDeals } from './linked-deals'
import { LinkedTasks } from './linked-tasks'
import { InteractionTimeline } from './interaction-timeline'
import { ContactForm } from '@/components/contacts/contact-form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface ContactDetailClientProps {
  contact: ContactWithOrgs
  deals: ContactDeal[]
  tasks: TaskWithRelations[]
  interactions: InteractionWithRelations[]
  organizations: { id: string; name: string }[]
  allContacts: { id: string; first_name: string; last_name: string }[]
  allDeals: { id: string; title: string }[]
}

export function ContactDetailClient({
  contact,
  deals,
  tasks,
  interactions,
  organizations,
  allContacts,
  allDeals,
}: ContactDetailClientProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="space-y-5">
      {/* Contact overview with edit/delete actions */}
      <div className="animate-fade-in">
        <ContactOverview
          contact={contact}
          onEditClick={() => setEditOpen(true)}
        />
      </div>

      {/* Middle section: Linked entities */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 animate-fade-in animate-delay-2">
        <LinkedDeals deals={deals} />
        <LinkedTasks tasks={tasks} contactId={contact.id} allDeals={allDeals} />
      </div>

      {/* Interaction timeline */}
      <div className="animate-fade-in animate-delay-3">
        <InteractionTimeline
          interactions={interactions}
          contacts={allContacts}
          deals={allDeals}
          defaultContactId={contact.id}
        />
      </div>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[540px] overflow-y-auto border-l border-white/6"
          style={{ background: 'oklch(0.10 0.003 280)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)',
            }}
          />
          <SheetHeader className="px-6 pt-8 pb-6">
            <SheetTitle className="text-lg font-bold text-gradient-violet">
              Edit Contact
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ContactForm
              contact={contact}
              organizations={organizations}
              onSuccess={() => {
                setEditOpen(false)
                router.refresh()
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
