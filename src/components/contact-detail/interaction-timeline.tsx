'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Phone, Mail, Calendar, FileText, Clock, Plus, Pencil, Trash2 } from 'lucide-react'
import type { InteractionWithRelations } from '@/lib/types/app'
import { deleteInteraction } from '@/lib/actions/interactions'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { InteractionFormModal } from '@/components/interactions/interaction-form-modal'
import { Button } from '@/components/ui/button'

const TYPE_CONFIG: Record<
  string,
  {
    Icon: React.ElementType
    accentOklch: string
    bgOklch: string
    borderOklch: string
    label: string
  }
> = {
  call: {
    Icon: Phone,
    accentOklch: 'oklch(0.65 0.18 150)',
    bgOklch: 'oklch(0.65 0.18 150 / 10%)',
    borderOklch: 'oklch(0.65 0.18 150 / 25%)',
    label: 'Call',
  },
  email: {
    Icon: Mail,
    accentOklch: 'oklch(0.60 0.20 220)',
    bgOklch: 'oklch(0.60 0.20 220 / 10%)',
    borderOklch: 'oklch(0.60 0.20 220 / 25%)',
    label: 'Email',
  },
  meeting: {
    Icon: Calendar,
    accentOklch: 'oklch(0.65 0.24 280)',
    bgOklch: 'oklch(0.65 0.24 280 / 10%)',
    borderOklch: 'oklch(0.65 0.24 280 / 25%)',
    label: 'Meeting',
  },
  note: {
    Icon: FileText,
    accentOklch: 'oklch(0.70 0.20 65)',
    bgOklch: 'oklch(0.70 0.20 65 / 10%)',
    borderOklch: 'oklch(0.70 0.20 65 / 25%)',
    label: 'Note',
  },
}

const DEFAULT_TYPE_CONFIG = {
  Icon: FileText,
  accentOklch: 'oklch(0.55 0 0)',
  bgOklch: 'oklch(0.18 0 0)',
  borderOklch: 'oklch(1 0 0 / 12%)',
  label: 'Interaction',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (diffDays === 0) return `Today · ${timeStr}`
  if (diffDays === 1) return `Yesterday · ${timeStr}`
  if (diffDays < 7) return `${diffDays}d ago · ${timeStr}`

  return (
    d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + ` · ${timeStr}`
  )
}

interface InteractionTimelineProps {
  interactions: InteractionWithRelations[]
  contacts?: { id: string; first_name: string; last_name: string }[]
  deals?: { id: string; title: string }[]
  defaultContactId?: string
  defaultDealId?: string
}

export function InteractionTimeline({
  interactions,
  contacts = [],
  deals = [],
  defaultContactId,
  defaultDealId,
}: InteractionTimelineProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [logOpen, setLogOpen] = useState(false)
  const [editInteraction, setEditInteraction] = useState<InteractionWithRelations | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sorted = [...interactions].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  )

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteInteraction(deleteId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Interaction deleted.')
        router.refresh()
      }
      setDeleteId(null)
    })
  }

  return (
    <div
      className="gradient-border-top rounded-xl overflow-hidden"
      style={{
        background: 'oklch(0.13 0.005 280)',
        border: '1px solid oklch(1 0 0 / 7%)',
      }}
    >
      {/* Section header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 5%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{
                background: 'oklch(0.60 0.24 300 / 12%)',
                border: '1px solid oklch(0.60 0.24 300 / 20%)',
              }}
            >
              <Clock
                className="h-3.5 w-3.5"
                style={{ color: 'oklch(0.60 0.24 300)' }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground/90">
              Interaction Timeline
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[10px] font-bold tabular-nums"
              style={{
                background: 'oklch(0.60 0.24 300 / 12%)',
                color: 'oklch(0.60 0.24 300)',
                border: '1px solid oklch(0.60 0.24 300 / 20%)',
              }}
            >
              {interactions.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs border-white/10 bg-transparent hover:bg-white/5 hover:border-white/15"
              onClick={() => setLogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Log
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: 'oklch(0.60 0.24 300 / 5%)',
                border: '1px solid oklch(0.60 0.24 300 / 10%)',
              }}
            >
              <Clock
                className="h-5 w-5"
                style={{ color: 'oklch(0.60 0.24 300 / 30%)' }}
              />
            </div>
            <p className="text-sm text-muted-foreground">No interactions recorded</p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-white/10 bg-transparent hover:bg-white/5"
              onClick={() => setLogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Log first interaction
            </Button>
          </div>
        ) : (
          <div className="relative">
            {/* Gradient timeline line */}
            <div
              className="absolute left-[17px] top-4 z-0"
              style={{
                width: '2px',
                bottom: '8px',
                background:
                  'linear-gradient(to bottom, oklch(0.65 0.24 280 / 50%), oklch(0.65 0.24 280 / 20%) 60%, transparent 100%)',
              }}
            />

            <div className="space-y-0">
              {sorted.map((interaction, index) => {
                const cfg = TYPE_CONFIG[interaction.type] ?? DEFAULT_TYPE_CONFIG
                const { Icon } = cfg
                const displayText =
                  interaction.subject ||
                  interaction.body ||
                  `${cfg.label} recorded`

                return (
                  <div
                    key={interaction.id}
                    className="relative flex gap-4 group"
                    style={{
                      paddingBottom: index < sorted.length - 1 ? '20px' : '0',
                    }}
                  >
                    {/* Icon node */}
                    <div
                      className="relative z-10 flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
                      style={{
                        background: cfg.bgOklch,
                        border: `1.5px solid ${cfg.borderOklch}`,
                        boxShadow: `0 0 0 4px oklch(0.13 0.005 280)`,
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: cfg.accentOklch }}
                      />
                    </div>

                    {/* Content card */}
                    <div
                      className="flex-1 min-w-0 rounded-lg overflow-hidden transition-all duration-200"
                      style={{
                        background: 'oklch(0.15 0.003 280)',
                        border: '1px solid oklch(1 0 0 / 6%)',
                        marginTop: '2px',
                      }}
                    >
                      {/* Top accent strip */}
                      <div
                        className="h-[2px] w-full"
                        style={{
                          background: `linear-gradient(90deg, ${cfg.accentOklch}, transparent)`,
                          opacity: 0.4,
                        }}
                      />

                      <div className="px-4 py-3">
                        {/* Header row */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                            style={{
                              background: cfg.bgOklch,
                              color: cfg.accentOklch,
                              border: `1px solid ${cfg.borderOklch}`,
                            }}
                          >
                            {cfg.label}
                          </span>

                          {interaction.duration_mins && (
                            <span
                              className="flex items-center gap-1 text-[10px] font-medium"
                              style={{ color: 'oklch(0.45 0 0)' }}
                            >
                              <Clock className="h-2.5 w-2.5" />
                              {interaction.duration_mins} min
                            </span>
                          )}

                          <span
                            className="ml-auto text-[10px] font-medium tabular-nums flex-shrink-0"
                            style={{ color: 'oklch(0.42 0 0)' }}
                          >
                            {formatDate(interaction.occurred_at)}
                          </span>

                          {/* Edit/Delete buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditInteraction(interaction)}
                              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground/80 hover:bg-white/5 transition-all"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(interaction.id)}
                              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 hover:text-destructive/70 hover:bg-destructive/8 transition-all"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: 'oklch(0.70 0 0)' }}
                        >
                          {displayText}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Log Interaction modal */}
      <InteractionFormModal
        open={logOpen}
        onOpenChange={setLogOpen}
        contacts={contacts}
        deals={deals}
        defaultContactId={defaultContactId}
        defaultDealId={defaultDealId}
        onSuccess={() => {
          setLogOpen(false)
          router.refresh()
        }}
      />

      {/* Edit Interaction modal */}
      {editInteraction && (
        <InteractionFormModal
          open={true}
          onOpenChange={(open) => !open && setEditInteraction(null)}
          interaction={editInteraction}
          contacts={contacts}
          deals={deals}
          onSuccess={() => {
            setEditInteraction(null)
            router.refresh()
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Interaction"
        description="Are you sure you want to delete this interaction? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  )
}
