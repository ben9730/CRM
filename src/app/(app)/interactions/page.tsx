import { getInteractions } from '@/lib/queries/interactions'
import { getContacts } from '@/lib/queries/contacts'
import { getDeals } from '@/lib/queries/deals'
import { InteractionList } from '@/components/interactions/interaction-list'
import { LogInteractionButton } from '@/components/interactions/log-interaction-button'
import { Pagination } from '@/components/shared/pagination'

interface InteractionsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function InteractionsPage({ searchParams }: InteractionsPageProps) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  const [interactionsResult, contactsResult, dealsResult] = await Promise.all([
    getInteractions({ page, pageSize: 20 }),
    getContacts({ pageSize: 200 }),
    getDeals(),
  ])

  const contacts = contactsResult.data.map((c) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
  }))

  const deals = dealsResult.map((d) => ({
    id: d.id,
    title: d.title,
  }))

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Calls, emails, meetings, and notes across all contacts.
          </p>
        </div>
        <LogInteractionButton contacts={contacts} deals={deals} />
      </div>

      {/* Interaction list */}
      <InteractionList
        interactions={interactionsResult.data}
        contacts={contacts}
        deals={deals}
      />

      {/* Pagination */}
      {interactionsResult.totalPages > 1 && (
        <Pagination
          currentPage={interactionsResult.page}
          totalPages={interactionsResult.totalPages}
        />
      )}
    </div>
  )
}
