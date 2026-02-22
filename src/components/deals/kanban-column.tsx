'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { PipelineStageRow, DealWithRelations } from '@/lib/types/app'
import { DealCard } from './deal-card'

function formatCurrency(value: number): string {
  if (value === 0) return '$0'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

interface KanbanColumnProps {
  stage: PipelineStageRow
  deals: DealWithRelations[]
  animationDelay?: number
}

export function KanbanColumn({ stage, deals, animationDelay = 0 }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  // Use stage.color (hex string from DB) for accents
  const hexColor = stage.color ?? '#6366f1'
  const dotStyle = { background: hexColor, boxShadow: `0 0 6px 1px ${hexColor}60` }
  const topGradient = `linear-gradient(90deg, transparent 0%, ${hexColor}B3 50%, transparent 100%)`
  const dropGlow = `${hexColor}14`

  return (
    <div
      className="animate-fade-in flex w-[272px] flex-shrink-0 flex-col rounded-xl overflow-hidden"
      style={{
        animationDelay: `${animationDelay}ms`,
        opacity: 0,
        background: 'oklch(0.12 0.004 280)',
        border: '1px solid oklch(1 0 0 / 6%)',
      }}
    >
      {/* Gradient top border accent using stage color */}
      <div style={{ height: '2px', background: topGradient, flexShrink: 0 }} />

      {/* Column header */}
      <div
        className="flex items-center justify-between px-3.5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 5%)' }}
      >
        <div className="flex items-center gap-2">
          {/* Colored dot indicator */}
          <div className="h-2 w-2 rounded-full flex-shrink-0" style={dotStyle} />
          <span className="text-[13px] font-semibold text-foreground/85 tracking-tight">
            {stage.name}
          </span>
          {/* Count badge */}
          <div
            className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
            style={{ background: 'oklch(1 0 0 / 6%)', color: 'oklch(0.70 0 0)' }}
          >
            {deals.length}
          </div>
        </div>

        {/* Column total value — always show (even when 0 with deals) */}
        {deals.length > 0 && (
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{ color: 'oklch(0.55 0 0)' }}
          >
            {formatCurrency(totalValue)}
          </span>
        )}
      </div>

      {/* Cards list — droppable zone */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 p-2.5 flex-1 overflow-y-auto min-h-[200px] transition-colors duration-200"
        style={{
          backgroundColor: isOver ? dropGlow : 'transparent',
          ...(isOver
            ? {
                outline: `1px dashed ${hexColor}40`,
                outlineOffset: '-4px',
              }
            : {}),
        }}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} stageColor={hexColor} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {deals.length === 0 && (
          <div
            className="flex flex-col items-center justify-center flex-1 py-10 rounded-lg border border-dashed select-none transition-all duration-300"
            style={{
              borderColor: isOver ? `${hexColor}50` : 'oklch(1 0 0 / 8%)',
              backgroundColor: isOver ? dropGlow : 'transparent',
            }}
          >
            <div
              className="h-8 w-8 rounded-full border border-dashed mb-2.5 flex items-center justify-center"
              style={{ borderColor: `${hexColor}30` }}
            >
              <div className="h-2 w-2 rounded-full opacity-30" style={{ background: hexColor }} />
            </div>
            <p className="text-[11px] text-muted-foreground/40 font-medium tracking-wide">
              Drop deals here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
