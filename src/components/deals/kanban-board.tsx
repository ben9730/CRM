'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { moveDealStage } from '@/lib/actions/deals'
import type { DealWithRelations, PipelineStageRow } from '@/lib/types/app'
import { KanbanColumn } from './kanban-column'
import { DealCard } from './deal-card'

interface KanbanBoardProps {
  initialDeals: DealWithRelations[]
  stages: PipelineStageRow[]
  onNewDeal?: () => void
}

export function KanbanBoard({ initialDeals, stages, onNewDeal }: KanbanBoardProps) {
  const [deals, setDeals] = useState<DealWithRelations[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) ?? null : null
  const activeStage = activeDeal
    ? stages.find((s) => s.id === activeDeal.stage_id) ?? null
    : null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)

    if (!over) return

    const dealId = active.id as string
    const overId = over.id as string

    // Determine target stage: either dropped on a column (stage.id) or on a deal card
    const targetStageId = stages.some((s) => s.id === overId)
      ? overId
      : deals.find((d) => d.id === overId)?.stage_id

    if (!targetStageId) return

    const currentDeal = deals.find((d) => d.id === dealId)
    if (!currentDeal || currentDeal.stage_id === targetStageId) return

    // Snapshot for rollback
    const snapshot = [...deals]

    // Optimistic update: move deal to new stage immediately
    const targetStage = stages.find((s) => s.id === targetStageId) ?? null
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage_id: targetStageId,
              pipeline_stages: targetStage,
            }
          : d
      )
    )

    // Persist to DB — roll back on error
    startTransition(async () => {
      const result = await moveDealStage(dealId, targetStageId)
      if (result?.error) {
        setDeals(snapshot)
        toast.error(`Failed to move deal: ${result.error}`)
      }
    })
  }

  // Group deals by stage_id
  const dealsByStage: Record<string, DealWithRelations[]> = {}
  for (const stage of stages) {
    dealsByStage[stage.id] = deals.filter((d) => d.stage_id === stage.id)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 h-full overflow-x-auto overflow-y-hidden px-6 py-5 pb-6">
        {stages.map((stage, index) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] ?? []}
            animationDelay={index * 60}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDeal ? (
          <DealCard deal={activeDeal} stageColor={activeStage?.color ?? null} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
