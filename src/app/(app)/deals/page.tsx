import { getDeals } from '@/lib/queries/deals'
import { getPipelineStages } from '@/lib/queries/pipeline-stages'
import { getOrganizationsList } from '@/lib/queries/organizations'
import { KanbanBoard } from '@/components/deals/kanban-board'
import { DealCreateButton } from '@/components/deals/deal-create-button'
import { TrendingUp } from 'lucide-react'

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
    <div className="flex flex-col h-full gap-0">
      {/* Page header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-border/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Deal Pipeline
              </h1>
            </div>
            <div className="flex items-center gap-4 pl-10">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Pipeline value:</span>
                <span className="text-gradient-violet font-bold text-sm">
                  {formatCurrency(totalPipelineValue)}
                </span>
              </div>
              <div className="h-3 w-px bg-border/60" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground/70 font-medium">{activeDeals}</span> active
              </span>
              <div className="h-3 w-px bg-border/60" />
              <span className="text-xs text-muted-foreground">
                <span className="text-emerald-400 font-medium">{wonDeals}</span> won
              </span>
            </div>
          </div>

          {/* New Deal button — client island */}
          <DealCreateButton stages={stages} organizations={organizations} />
        </div>
      </div>

      {/* Kanban board — client component with live data */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard initialDeals={deals} stages={stages} />
      </div>
    </div>
  )
}
