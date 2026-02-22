'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'
import type { DealWithRelations } from '@/lib/types/app'

function formatCurrency(value: number | null): string {
  if (!value) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

// Derive card accent color from stage hex color (e.g. "#6366f1")
function hexToOklchApprox(hex: string | null): {
  border: string
  valueBg: string
  valueText: string
  glowColor: string
} {
  // Default violet accent when no color provided
  const defaults = {
    border: 'oklch(0.60 0.22 270)',
    valueBg: 'oklch(0.60 0.22 270 / 12%)',
    valueText: 'oklch(0.75 0.18 270)',
    glowColor: 'oklch(0.60 0.22 270 / 10%)',
  }
  if (!hex) return defaults
  // Parse hex to RGB then approximate OKLCH hue
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  if (isNaN(r) || isNaN(g) || isNaN(b)) return defaults
  // Use the hex color directly in rgba approximations via CSS color-mix-like logic
  return {
    border: `color-mix(in oklch, ${hex} 80%, transparent)`,
    valueBg: `color-mix(in oklch, ${hex} 12%, transparent)`,
    valueText: `color-mix(in oklch, ${hex} 100%, white 20%)`,
    glowColor: `color-mix(in oklch, ${hex} 10%, transparent)`,
  }
}

interface DealCardProps {
  deal: DealWithRelations
  stageColor?: string | null
  isOverlay?: boolean
}

export function DealCard({ deal, stageColor, isOverlay = false }: DealCardProps) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const colors = hexToOklchApprox(stageColor ?? deal.pipeline_stages?.color ?? null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  function handleClick(e: React.MouseEvent) {
    // Don't navigate if we're dragging
    if (isDragging) return
    e.stopPropagation()
    router.push(`/deals/${deal.id}`)
  }

  if (isOverlay) {
    return (
      <div
        style={{
          background: 'oklch(0.16 0.008 280)',
          border: `1px solid oklch(1 0 0 / 12%)`,
          borderLeft: `3px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '12px',
          transform: 'rotate(2deg) scale(1.03)',
          boxShadow: `0 16px 40px -8px oklch(0 0 0 / 60%), 0 0 0 1px oklch(1 0 0 / 5%)`,
          cursor: 'grabbing',
          width: '248px',
          pointerEvents: 'none',
        }}
      >
        <CardContent deal={deal} colors={colors} />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? 'transparent' : 'oklch(0.135 0.006 280)',
        border: isDragging
          ? `1px dashed oklch(1 0 0 / 10%)`
          : `1px solid oklch(1 0 0 / 6%)`,
        borderLeft: isDragging
          ? `3px dashed oklch(1 0 0 / 15%)`
          : `3px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.3 : 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="group select-none hover:shadow-md"
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (isDragging) return
        const el = e.currentTarget
        el.style.borderColor = `oklch(1 0 0 / 10%)`
        el.style.borderLeftColor = colors.border
        el.style.boxShadow = `0 4px 16px -4px oklch(0 0 0 / 30%)`
        el.style.background = 'oklch(0.15 0.008 280)'
      }}
      onMouseLeave={(e) => {
        if (isDragging) return
        const el = e.currentTarget
        el.style.borderColor = 'oklch(1 0 0 / 6%)'
        el.style.borderLeftColor = colors.border
        el.style.boxShadow = 'none'
        el.style.background = 'oklch(0.135 0.006 280)'
      }}
      {...attributes}
      {...listeners}
    >
      <CardContent deal={deal} colors={colors} />
    </div>
  )
}

interface CardContentProps {
  deal: DealWithRelations
  colors: {
    border: string
    valueBg: string
    valueText: string
    glowColor: string
  }
}

function CardContent({ deal, colors }: CardContentProps) {
  return (
    <>
      {/* Deal title + value badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p
          className="text-[13px] font-semibold leading-snug line-clamp-2 flex-1"
          style={{ color: 'oklch(0.90 0.01 280)' }}
        >
          {deal.title}
        </p>
        {deal.value != null && (
          <div
            className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums"
            style={{
              background: colors.valueBg,
              color: colors.valueText,
              border: `1px solid oklch(1 0 0 / 8%)`,
            }}
          >
            {formatCurrency(deal.value)}
          </div>
        )}
      </div>

      {/* Organization */}
      {deal.organizations && (
        <div className="flex items-center gap-1.5">
          <Building2
            className="h-3 w-3 flex-shrink-0"
            style={{ color: 'oklch(0.50 0 0)' }}
          />
          <p className="text-[11px] truncate" style={{ color: 'oklch(0.55 0 0)' }}>
            {deal.organizations.name}
          </p>
        </div>
      )}
    </>
  )
}
