import { Suspense } from 'react'
import { getContacts, getAvailableTags } from '@/lib/queries/contacts'
import { getOrganizationsList } from '@/lib/queries/organizations'
import { ContactsViewWrapper } from '@/components/contacts/contacts-view-wrapper'
import { ContactSearchForm } from '@/components/contacts/contact-search-form'
import { ContactCreateButton } from '@/components/contacts/contact-create-button'
import { Pagination } from '@/components/shared/pagination'
import { Users } from 'lucide-react'

interface ContactsPageProps {
  searchParams: Promise<{
    search?: string
    tag?: string
    org?: string
    page?: string
  }>
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = await searchParams
  const search = params.search ?? ''
  const tag = params.tag ?? ''
  const org = params.org ?? ''
  const page = parseInt(params.page ?? '1', 10) || 1

  const [result, availableTags, organizations] = await Promise.all([
    getContacts({ search, tag, orgId: org, page }),
    getAvailableTags(),
    getOrganizationsList(),
  ])

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.65 0.24 280 / 5%) 0%, transparent 60%)',
        }}
      />

      {/* Page header */}
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
            style={{
              background:
                'linear-gradient(135deg, oklch(0.65 0.24 280 / 20%), oklch(0.55 0.24 300 / 20%))',
              boxShadow: '0 0 16px -4px oklch(0.65 0.24 280 / 20%)',
              border: '1px solid oklch(0.65 0.24 280 / 15%)',
            }}
          >
            <Users className="h-5 w-5 text-primary/80" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient-violet">Contacts</h1>
            <p className="text-sm text-muted-foreground/60 mt-0.5">
              {result.total} {result.total === 1 ? 'contact' : 'contacts'}
              {search && ` matching "${search}"`}
              {tag && ` tagged "${tag}"`}
            </p>
          </div>
        </div>

        <ContactCreateButton organizations={organizations} />
      </div>

      {/* Gradient separator */}
      <div
        className="relative z-10 h-px animate-fade-in animate-delay-1"
        style={{
          background:
            'linear-gradient(90deg, oklch(0.65 0.24 280 / 20%), oklch(0.65 0.24 280 / 5%), transparent)',
        }}
      />

      {/* Search + Filters */}
      <div className="relative z-10 animate-fade-in animate-delay-1">
        <Suspense fallback={null}>
          <ContactSearchForm
            defaultSearch={search}
            defaultTag={tag}
            defaultOrg={org}
            availableTags={availableTags}
            availableOrgs={organizations}
          />
        </Suspense>
      </div>

      {/* Content: View toggle + Table or Grid */}
      <div className="relative z-10 animate-fade-in animate-delay-2">
        <ContactsViewWrapper contacts={result.data} />
      </div>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="relative z-10">
          <Suspense fallback={null}>
            <Pagination currentPage={result.page} totalPages={result.totalPages} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
