'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { OrgRow } from '@/lib/types/app'
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
import { Building2, Phone, Globe, MapPin, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  lab: 'Lab',
  other: 'Other',
}

const TYPE_STYLES: Record<string, string> = {
  hospital: 'border-blue-500/30 text-blue-400 bg-blue-500/8',
  clinic: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/8',
  lab: 'border-purple-500/30 text-purple-400 bg-purple-500/8',
  other: 'border-white/15 text-muted-foreground bg-white/4',
}

interface OrgListProps {
  organizations: OrgRow[]
}

export function OrgList({ organizations }: OrgListProps) {
  const router = useRouter()
  const [editOrg, setEditOrg] = useState<OrgRow | null>(null)
  const [deleteOrg, setDeleteOrg] = useState<OrgRow | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{
            background: 'oklch(0.65 0.24 280 / 5%)',
            border: '1px solid oklch(0.65 0.24 280 / 10%)',
          }}
        >
          <Building2 className="h-6 w-6" style={{ color: 'oklch(0.65 0.24 280 / 30%)' }} />
        </div>
        <p className="text-sm text-muted-foreground">No organizations found</p>
      </div>
    )
  }

  function handleDelete() {
    if (!deleteOrg) return
    startDeleteTransition(async () => {
      const result = await deleteOrganization(deleteOrg.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Organization deleted')
        setDeleteOrg(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* List */}
      <div
        className="rounded-xl border border-white/6 overflow-hidden"
        style={{ background: 'oklch(0.13 0.005 280)' }}
      >
        {/* Top accent */}
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 35%), transparent)',
          }}
        />

        <div className="divide-y divide-white/4">
          {organizations.map((org) => {
            const typeLabel = org.type ? (TYPE_LABELS[org.type] ?? org.type) : null
            const typeStyle = org.type ? (TYPE_STYLES[org.type] ?? TYPE_STYLES.other) : TYPE_STYLES.other
            const location = [org.city, org.state].filter(Boolean).join(', ')

            return (
              <div
                key={org.id}
                className="group flex items-center gap-4 px-5 py-4 transition-all duration-150"
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'oklch(0.22 0.04 280 / 20%)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'transparent'
                }}
              >
                {/* Org icon */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: 'oklch(0.65 0.24 280 / 10%)',
                    border: '1px solid oklch(0.65 0.24 280 / 15%)',
                  }}
                >
                  <Building2 className="h-5 w-5" style={{ color: 'oklch(0.65 0.24 280 / 70%)' }} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link
                      href={`/organizations/${org.id}`}
                      className="font-semibold text-sm text-foreground/90 hover:text-gradient-violet transition-all duration-150 truncate"
                    >
                      {org.name}
                    </Link>
                    {typeLabel && (
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium flex-shrink-0 ${typeStyle}`}
                      >
                        {typeLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                    {org.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {org.phone}
                      </span>
                    )}
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {location}
                      </span>
                    )}
                    {org.website && (
                      <a
                        href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="h-3 w-3" />
                        {org.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>

                {/* Action buttons — visible on hover */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-white/8"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditOrg(org)
                    }}
                    aria-label={`Edit ${org.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteOrg(org)
                    }}
                    aria-label={`Delete ${org.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive/60 hover:text-destructive" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={!!editOrg} onOpenChange={(open) => !open && setEditOrg(null)}>
        <SheetContent
          side="right"
          className="w-full sm:w-[520px] overflow-y-auto border-l border-white/6"
          style={{ background: 'oklch(0.10 0.003 280)' }}
        >
          {/* Top gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, oklch(0.65 0.24 280 / 50%), transparent)',
            }}
          />
          <SheetHeader className="px-6 pt-8 pb-6">
            <SheetTitle className="text-lg font-bold text-gradient-violet">
              Edit Organization
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            {editOrg && (
              <OrgForm
                organization={editOrg}
                onSuccess={() => {
                  setEditOrg(null)
                  router.refresh()
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteOrg}
        onOpenChange={(open) => !open && setDeleteOrg(null)}
        title="Delete Organization"
        description={`Are you sure you want to delete "${deleteOrg?.name}"? This action can be undone by an admin.`}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}
