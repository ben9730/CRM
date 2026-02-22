import { notFound } from 'next/navigation'
import { getDeal } from '@/lib/queries/deals'
import { getPipelineStages } from '@/lib/queries/pipeline-stages'
import { getOrganizationsList } from '@/lib/queries/organizations'
import { getContacts } from '@/lib/queries/contacts'
import { getDealsList } from '@/lib/queries/deals'
import { getInteractionsByDeal } from '@/lib/queries/interactions'
import { getTasksByDeal } from '@/lib/queries/tasks'
import { DealDetailView } from '@/components/deals/deal-detail-view'

interface DealPageProps {
  params: Promise<{ id: string }>
}

export default async function DealDetailPage({ params }: DealPageProps) {
  const { id } = await params

  // Parallel data fetch
  const [deal, stages, organizations, contactsResult, dealsList, interactions, tasks] =
    await Promise.all([
      getDeal(id),
      getPipelineStages(),
      getOrganizationsList(),
      getContacts({ pageSize: 200 }),
      getDealsList(),
      getInteractionsByDeal(id),
      getTasksByDeal(id),
    ])

  if (!deal) {
    notFound()
  }

  const contacts = contactsResult.data.map((c) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
  }))

  return (
    <DealDetailView
      deal={deal}
      stages={stages}
      organizations={organizations}
      contacts={contacts}
      allDeals={dealsList}
      interactions={interactions}
      tasks={tasks}
    />
  )
}
