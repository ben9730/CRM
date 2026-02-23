import { getDeals } from '@/lib/queries/deals'
import { getPipelineStages } from '@/lib/queries/pipeline-stages'
import { getOrganizationsList } from '@/lib/queries/organizations'
import { KanbanPageClient } from '@/components/deals/kanban-page-client'

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

export default async function DealsPage() {
  // Parallel data fetch: deals, stages, orgs (for deal creation form)
  const [deals, stages, organizations] = await Promise.all([
    getDeals(),
    getPipelineStages(),
    getOrganizationsList(),
  ])

  // Compute pipeline metrics from live data
  const wonStageIds = new Set(stages.filter((s) => s.is_won).map((s) => s.id))
  const lostStageIds = new Set(stages.filter((s) => s.is_lost).map((s) => s.id))

  const totalPipelineValue = deals
    .filter((d) => !lostStageIds.has(d.stage_id))
    .reduce((sum, d) => sum + (d.value ?? 0), 0)

  const activeDeals = deals.filter(
    (d) => !wonStageIds.has(d.stage_id) && !lostStageIds.has(d.stage_id)
  ).length

  const wonDeals = deals.filter((d) => wonStageIds.has(d.stage_id)).length

  return (
    <KanbanPageClient
      initialDeals={deals}
      stages={stages}
      organizations={organizations}
      totalPipelineValue={formatCurrency(totalPipelineValue)}
      activeDeals={activeDeals}
      wonDeals={wonDeals}
    />
  )
}
