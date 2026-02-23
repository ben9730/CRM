'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DealWithRelations, PipelineStageRow } from '@/lib/types/app'
import { KanbanBoard } from './kanban-board'
import { DealCreateButton } from './deal-create-button'
import { ExportButton } from '@/components/shared/export-button'
import { TrendingUp } from 'lucide-react'

interface OrgOption {
  id: string
  name: string
}

interface KanbanPageClientProps {
  initialDeals: DealWithRelations[]
  stages: PipelineStageRow[]
  organizations: OrgOption[]
  totalPipelineValue: string
  activeDeals: number
  wonDeals: number
}

export function KanbanPageClient({
  initialDeals,
  stages,
  organizations,
  totalPipelineValue,
  activeDeals,
  wonDeals,
}: KanbanPageClientProps) {
  const [deals, setDeals] = useState<DealWithRelations[]>(initialDeals)
  const router = useRouter()

  function handleDealCreated(newDeal?: DealWithRelations) {
    if (newDeal) {
      // Optimistically add the new deal to local state
      setDeals((prev) => [newDeal, ...prev])
    }
    // Also trigger server refresh to keep server state in sync
    router.refresh()
  }

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
                  {totalPipelineValue}
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

          {/* Actions: Export + New Deal */}
          <div className="flex items-center gap-2">
            <ExportButton entity="deals" />
            <DealCreateButton
              stages={stages}
              organizations={organizations}
              onDealCreated={handleDealCreated}
            />
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard deals={deals} stages={stages} onDealsChange={setDeals} />
      </div>
    </div>
  )
}
