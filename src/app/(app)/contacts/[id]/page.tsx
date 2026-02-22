import { notFound } from 'next/navigation'
import {
  getContact,
  getContactDeals,
  getContactTasks,
  getContactInteractions,
} from '@/lib/queries/contacts'
import { getOrganizationsList } from '@/lib/queries/organizations'
import { getContacts } from '@/lib/queries/contacts'
import { getDealsList } from '@/lib/queries/deals'
import { ContactDetailClient } from '@/components/contact-detail/contact-detail-client'

interface ContactDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params

  const [contact, deals, tasks, interactions, organizations, allContactsResult, allDeals] =
    await Promise.all([
      getContact(id),
      getContactDeals(id),
      getContactTasks(id),
      getContactInteractions(id),
      getOrganizationsList(),
      getContacts({ pageSize: 200 }),
      getDealsList(),
    ])

  if (!contact) {
    notFound()
  }

  const allContacts = allContactsResult.data.map((c) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
  }))

  return (
    <div className="p-4 sm:p-6">
      {/* Ambient background gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.65 0.24 280 / 5%) 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10">
        <ContactDetailClient
          contact={contact}
          deals={deals}
          tasks={tasks}
          interactions={interactions}
          organizations={organizations}
          allContacts={allContacts}
          allDeals={allDeals}
        />
      </div>
    </div>
  )
}
