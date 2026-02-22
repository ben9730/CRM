'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import type { DealWithRelations, PipelineStageRow, InteractionWithRelations, TaskWithRelations } from '@/lib/types/app'
import { deleteDeal } from '@/lib/actions/deals'
import { DealForm } from './deal-form'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { InteractionTimeline } from '@/components/contact-detail/interaction-timeline'
import { LinkedTasks } from '@/components/contact-detail/linked-tasks'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Building2,
  Users,
  Calendar,
  FileText,
  Pencil,
  Trash2,
  ArrowLeft,
} from 'lucide-react'

function formatCurrency(value: number | null): string {
  if (value == null) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface OrgOption {
  id: string
  name: string
}

interface ContactOption {
  id: string
  first_name: string
  last_name: string
}

interface DealDetailViewProps {
  deal: DealWithRelations
  stages: PipelineStageRow[]
  organizations: OrgOption[]
  contacts: ContactOption[]
  allDeals?: { id: string; title: string }[]
  interactions?: InteractionWithRelations[]
  tasks?: TaskWithRelations[]
}

export function DealDetailView({
  deal,
  stages,
  organizations,
  contacts,
  allDeals = [],
  interactions = [],
  tasks = [],
}: DealDetailViewProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const stage = deal.pipeline_stages
  const hexColor = stage?.color ?? '#6366f1'

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDeal(deal.id)
      if (result?.error) {
        toast.error(result.error)
        setDeleteOpen(false)
      } else {
        toast.success('Deal deleted.')
        router.push('/deals')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex-shrink-0 px-6 pt-6 pb-5"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 6%)' }}
      >
        {/* Back link */}
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground/90 transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Pipeline
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
              style={{ background: `${hexColor}20`, border: `1px solid ${hexColor}30` }}
            >
              <TrendingUp className="h-5 w-5" style={{ color: hexColor }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {deal.title}
              </h1>
              {stage && (
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      background: `${hexColor}18`,
                      color: hexColor,
                      border: `1px solid ${hexColor}30`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: hexColor }}
                    />
                    {stage.name}
                  </span>
                  {deal.value != null && (
                    <span className="text-sm font-semibold text-gradient-violet">
                      {formatCurrency(deal.value)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-white/10 bg-transparent hover:bg-white/5 hover:border-white/15 text-xs"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-500/20 bg-transparent text-red-400/70 hover:bg-red-500/8 hover:border-red-500/30 hover:text-red-400 text-xs"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Deal info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Organization */}
          <InfoCard
            icon={<Building2 className="h-4 w-4" />}
            label="Organization"
            value={
              deal.organizations ? (
                <Link
                  href={`/organizations/${deal.organizations.id}`}
                  className="text-primary/80 hover:text-primary transition-colors"
                >
                  {deal.organizations.name}
                </Link>
              ) : (
                <span className="text-muted-foreground/40">—</span>
              )
            }
          />

          {/* Expected Close */}
          <InfoCard
            icon={<Calendar className="h-4 w-4" />}
            label="Expected Close"
            value={<span>{formatDate(deal.expected_close)}</span>}
          />

          {/* Value */}
          <InfoCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Deal Value"
            value={
              <span className="font-semibold text-foreground/90">
                {formatCurrency(deal.value)}
              </span>
            }
          />

          {/* Stage */}
          <InfoCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Pipeline Stage"
            value={<span>{stage?.name ?? '—'}</span>}
          />
        </div>

        {/* Linked Contacts */}
        {deal.contacts && deal.contacts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Linked Contacts
            </h2>
            <div className="space-y-2">
              {deal.contacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
                  style={{
                    background: 'oklch(0.12 0.004 280)',
                    border: '1px solid oklch(1 0 0 / 6%)',
                  }}
                >
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{
                      background: 'oklch(0.55 0.22 280 / 15%)',
                      color: 'oklch(0.75 0.18 280)',
                    }}
                  >
                    {contact.first_name.charAt(0)}
                  </div>
                  <span className="text-sm text-foreground/80">
                    {contact.first_name} {contact.last_name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {deal.notes && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </h2>
            <div
              className="rounded-lg px-4 py-3 text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap"
              style={{
                background: 'oklch(0.12 0.004 280)',
                border: '1px solid oklch(1 0 0 / 6%)',
              }}
            >
              {deal.notes}
            </div>
          </section>
        )}

        {/* Tasks section */}
        <LinkedTasks
          tasks={tasks}
          dealId={deal.id}
          allContacts={contacts}
          allDeals={allDeals}
        />

        {/* Interaction Timeline */}
        <InteractionTimeline
          interactions={interactions}
          contacts={contacts}
          deals={allDeals}
          defaultDealId={deal.id}
        />
      </div>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[520px] overflow-y-auto border-l border-white/6"
          style={{ background: 'oklch(0.10 0.003 280)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)',
            }}
          />
          <SheetHeader className="px-6 pt-8 pb-6">
            <SheetTitle className="text-lg font-bold text-gradient-violet">
              Edit Deal
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <DealForm
              deal={deal}
              stages={stages}
              organizations={organizations}
              contacts={contacts}
              onSuccess={() => {
                setEditOpen(false)
                router.refresh()
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Deal"
        description={`Are you sure you want to delete "${deal.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  )
}

interface InfoCardProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: 'oklch(0.12 0.004 280)',
        border: '1px solid oklch(1 0 0 / 6%)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground/50">
        <span className="h-3.5 w-3.5">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm text-foreground/75 pl-5">{value}</div>
    </div>
  )
}
