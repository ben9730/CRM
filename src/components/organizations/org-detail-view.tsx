'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import type { OrgWithRelations } from '@/lib/types/app'
import { deleteOrganization } from '@/lib/actions/organizations'
import { OrgForm } from './org-form'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  FileText,
  Pencil,
  Trash2,
  ArrowLeft,
  Users,
  Briefcase,
  Calendar,
  Mail,
  TrendingUp,
} from 'lucide-react'

interface OrgContact {
  id: string
  first_name: string
  last_name: string
  title: string | null
  email: string | null
  phone: string | null
  tags: string[] | null
  is_primary: boolean
}

interface OrgDeal {
  id: string
  title: string
  value: number | null
  currency: string
  expected_close: string | null
  stage_name: string
  stage_color: string | null
}

interface OrgDetailViewProps {
  org: OrgWithRelations
  contacts: OrgContact[]
  deals: OrgDeal[]
}

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

const TYPE_LABELS: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  lab: 'Lab',
  other: 'Other',
}

export function OrgDetailView({ org, contacts, deals }: OrgDetailViewProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteOrganization(org.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Organization deleted')
        router.push('/organizations')
      }
    })
  }

  const location = [org.address, org.city, org.state].filter(Boolean).join(', ')

  return (
    <>
      <div className="space-y-5">
        {/* Header card */}
        <div
          className="gradient-border-top rounded-xl overflow-hidden"
          style={{
            background: 'oklch(0.13 0.005 280)',
            border: '1px solid oklch(1 0 0 / 7%)',
          }}
        >
          {/* Gradient mesh background */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 0% 0%, oklch(0.65 0.24 280 / 7%) 0%, transparent 60%)',
            }}
          />

          <div className="relative p-6">
            {/* Back link */}
            <Link
              href="/organizations"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-all duration-200 mb-6 px-3 py-1.5 rounded-md"
              style={{
                background: 'oklch(0.16 0.005 280)',
                border: '1px solid oklch(1 0 0 / 8%)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'oklch(0.65 0.24 280 / 25%)'
                el.style.color = 'oklch(0.85 0 0)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'oklch(1 0 0 / 8%)'
                el.style.color = ''
              }}
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Organizations
            </Link>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Org icon */}
              <div
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.65 0.24 280 / 20%), oklch(0.55 0.24 300 / 20%))',
                  border: '1px solid oklch(0.65 0.24 280 / 20%)',
                  boxShadow: '0 0 24px -4px oklch(0.65 0.24 280 / 20%)',
                }}
              >
                <Building2 className="h-8 w-8" style={{ color: 'oklch(0.70 0.20 280)' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient-violet" style={{ lineHeight: 1.2 }}>
                      {org.name}
                    </h1>
                    {org.type && (
                      <p className="text-sm text-muted-foreground/70 mt-1 capitalize">
                        {TYPE_LABELS[org.type] ?? org.type}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-7 px-2.5 border-border/40 bg-transparent hover:bg-white/5 hover:border-border/60"
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-7 px-2.5 bg-transparent"
                      style={{
                        borderColor: 'oklch(0.55 0.22 25 / 30%)',
                        color: 'oklch(0.55 0.22 25)',
                      }}
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Contact info pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {org.phone && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'oklch(0.60 0.18 160 / 10%)',
                        border: '1px solid oklch(0.60 0.18 160 / 20%)',
                        color: 'oklch(0.60 0.15 160)',
                      }}
                    >
                      <Phone className="h-3 w-3" />
                      {org.phone}
                    </span>
                  )}
                  {org.website && (
                    <a
                      href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
                      style={{
                        background: 'oklch(0.65 0.24 220 / 10%)',
                        border: '1px solid oklch(0.65 0.24 220 / 20%)',
                        color: 'oklch(0.65 0.18 220)',
                      }}
                    >
                      <Globe className="h-3 w-3" />
                      {org.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {location && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'oklch(0.60 0 0 / 8%)',
                        border: '1px solid oklch(1 0 0 / 8%)',
                        color: 'oklch(0.55 0 0)',
                      }}
                    >
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground/60">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground/70">{org.contact_count}</span>
                    {org.contact_count === 1 ? 'contact' : 'contacts'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground/70">{org.deal_count}</span>
                    {org.deal_count === 1 ? 'deal' : 'deals'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {org.notes && (
              <div
                className="mt-5 rounded-lg p-4"
                style={{
                  background: 'oklch(0.16 0.005 280)',
                  border: '1px solid oklch(1 0 0 / 6%)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Notes
                  </span>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">{org.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Contacts and Deals */}
        <Tabs defaultValue="contacts">
          <TabsList
            className="border border-white/8"
            style={{ background: 'oklch(0.13 0.005 280)' }}
          >
            <TabsTrigger value="contacts" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-1.5 text-xs">
              <Briefcase className="h-3.5 w-3.5" />
              Deals ({deals.length})
            </TabsTrigger>
          </TabsList>

          {/* Contacts tab */}
          <TabsContent value="contacts" className="mt-4">
            <div
              className="rounded-xl border border-white/6 overflow-hidden"
              style={{ background: 'oklch(0.13 0.005 280)' }}
            >
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                  <Users className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No contacts linked</p>
                </div>
              ) : (
                <div className="divide-y divide-white/4">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          background: 'linear-gradient(135deg, oklch(0.65 0.24 280 / 20%), oklch(0.55 0.20 300 / 20%))',
                          color: 'oklch(0.70 0.18 280)',
                        }}
                      >
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/contacts/${c.id}`}
                          className="font-medium text-sm text-foreground/90 hover:text-primary transition-colors"
                        >
                          {c.first_name} {c.last_name}
                          {c.is_primary && (
                            <span className="ml-2 text-[10px] font-medium text-primary/70">(primary)</span>
                          )}
                        </Link>
                        {c.title && <p className="text-xs text-muted-foreground/60">{c.title}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Mail className="h-3 w-3" />
                          </a>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Deals tab */}
          <TabsContent value="deals" className="mt-4">
            <div
              className="rounded-xl border border-white/6 overflow-hidden"
              style={{ background: 'oklch(0.13 0.005 280)' }}
            >
              {deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
                  <Briefcase className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No deals linked</p>
                </div>
              ) : (
                <div className="divide-y divide-white/4">
                  {deals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground/90 truncate">{deal.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              background: deal.stage_color
                                ? `${deal.stage_color}1a`
                                : 'oklch(0.65 0.24 280 / 10%)',
                              color: deal.stage_color ?? 'oklch(0.65 0.18 280)',
                              border: `1px solid ${deal.stage_color ? `${deal.stage_color}33` : 'oklch(0.65 0.24 280 / 20%)'}`,
                            }}
                          >
                            {deal.stage_name}
                          </span>
                          {deal.expected_close && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(deal.expected_close).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      {deal.value !== null && (
                        <div className="flex-shrink-0 text-right">
                          <p
                            className="text-base font-bold tabular-nums"
                            style={{
                              background: 'linear-gradient(135deg, oklch(0.85 0.05 280), oklch(0.97 0 0))',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {formatCurrency(deal.value, deal.currency)}
                          </p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <TrendingUp className="h-2.5 w-2.5" style={{ color: 'oklch(0.65 0.18 150)' }} />
                            <span className="text-[10px] font-medium" style={{ color: 'oklch(0.65 0.18 150)' }}>
                              pipeline
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
              background: 'linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)',
            }}
          />
          <SheetHeader className="px-6 pt-8 pb-6">
            <SheetTitle className="text-lg font-bold text-gradient-violet">Edit Organization</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <OrgForm
              organization={org}
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
        title="Delete Organization"
        description={`Are you sure you want to delete "${org.name}"? This will remove it from the list.`}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}
