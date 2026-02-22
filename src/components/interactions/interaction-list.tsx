'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Phone, Mail, Calendar, FileText, Clock, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { InteractionWithRelations } from '@/lib/types/app'
import { deleteInteraction } from '@/lib/actions/interactions'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { InteractionFormModal } from './interaction-form-modal'
import { Button } from '@/components/ui/button'

const TYPE_CONFIG: Record<
  string,
  { Icon: React.ElementType; color: string; bg: string; label: string }
> = {
  call: {
    Icon: Phone,
    color: 'oklch(0.65 0.18 150)',
    bg: 'oklch(0.65 0.18 150 / 12%)',
    label: 'Call',
  },
  email: {
    Icon: Mail,
    color: 'oklch(0.60 0.20 220)',
    bg: 'oklch(0.60 0.20 220 / 12%)',
    label: 'Email',
  },
  meeting: {
    Icon: Calendar,
    color: 'oklch(0.65 0.24 280)',
    bg: 'oklch(0.65 0.24 280 / 12%)',
    label: 'Meeting',
  },
  note: {
    Icon: FileText,
    color: 'oklch(0.70 0.20 65)',
    bg: 'oklch(0.70 0.20 65 / 12%)',
    label: 'Note',
  },
}

const DEFAULT_CONFIG = {
  Icon: FileText,
  color: 'oklch(0.55 0 0)',
  bg: 'oklch(0.18 0 0)',
  label: 'Interaction',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ` · ${timeStr}`
  )
}

interface InteractionListProps {
  interactions: InteractionWithRelations[]
  contacts: { id: string; first_name: string; last_name: string }[]
  deals: { id: string; title: string }[]
}

export function InteractionList({ interactions, contacts, deals }: InteractionListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editInteraction, setEditInteraction] = useState<InteractionWithRelations | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState<string>('')

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

  if (interactions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-xl"
        style={{
          background: 'oklch(0.12 0.004 280)',
          border: '1px dashed oklch(1 0 0 / 8%)',
        }}
      >
        <FileText className="h-8 w-8 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground/50">No interactions logged yet.</p>
        <p className="text-xs text-muted-foreground/35 mt-1">
          Use the Log Interaction button to record calls, emails, meetings, and notes.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {interactions.map((interaction) => {
          const cfg = TYPE_CONFIG[interaction.type] ?? DEFAULT_CONFIG
          const { Icon } = cfg
          const displayText =
            interaction.subject || interaction.body?.slice(0, 80) || `${cfg.label} recorded`
          const contactName = interaction.contacts
            ? `${interaction.contacts.first_name} ${interaction.contacts.last_name}`
            : null
          const dealTitle = interaction.deals?.title ?? null

          return (
            <div
              key={interaction.id}
              className="group relative rounded-xl overflow-hidden transition-all duration-200"
              style={{
                background: 'oklch(0.12 0.004 280)',
                border: '1px solid oklch(1 0 0 / 6%)',
              }}
            >
              {/* Top color strip */}
              <div
                className="h-[2px] w-full"
                style={{
                  background: `linear-gradient(90deg, ${cfg.color}, transparent)`,
                  opacity: 0.5,
                }}
              />

              <div className="flex items-start gap-3 px-4 py-3">
                {/* Icon */}
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg mt-0.5"
                  style={{ background: cfg.bg }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.color}30`,
                      }}
                    >
                      {cfg.label}
                    </span>
                    {interaction.duration_mins && (
                      <span
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: 'oklch(0.45 0 0)' }}
                      >
                        <Clock className="h-2.5 w-2.5" />
                        {interaction.duration_mins} min
                      </span>
                    )}
                    <span
                      className="ml-auto text-[10px] tabular-nums"
                      style={{ color: 'oklch(0.42 0 0)' }}
                    >
                      {formatDate(interaction.occurred_at)}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/80 truncate">{displayText}</p>

                  {(contactName || dealTitle) && (
                    <div className="flex items-center gap-2 mt-1">
                      {contactName && (
                        <Link
                          href={`/contacts/${interaction.contact_id}`}
                          className="text-[11px] text-primary/70 hover:text-primary/90 transition-colors"
                        >
                          {contactName}
                        </Link>
                      )}
                      {contactName && dealTitle && (
                        <span className="text-[11px] text-muted-foreground/30">·</span>
                      )}
                      {dealTitle && (
                        <Link
                          href={`/deals/${interaction.deal_id}`}
                          className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors truncate"
                        >
                          {dealTitle}
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-white/6"
                    onClick={() => setEditInteraction(interaction)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/8"
                    onClick={() => {
                      setDeleteId(interaction.id)
                      setDeleteTitle(interaction.subject || cfg.label)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
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
        description={`Are you sure you want to delete this ${deleteTitle} interaction? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  )
}
