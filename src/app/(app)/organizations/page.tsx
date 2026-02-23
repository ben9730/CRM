import { Suspense } from 'react'
import { getOrganizations } from '@/lib/queries/organizations'
import { OrgList } from '@/components/organizations/org-list'
import { SearchForm } from '@/components/shared/search-form'
import { Pagination } from '@/components/shared/pagination'
import { OrgCreateButton } from '@/components/organizations/org-create-button'
import { ExportButton } from '@/components/shared/export-button'
import { Building2 } from 'lucide-react'

interface OrganizationsPageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function OrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const params = await searchParams
  const search = params.search ?? ''
  const page = parseInt(params.page ?? '1', 10) || 1

  const result = await getOrganizations({ search, page })

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
            <Building2 className="h-5 w-5 text-primary/80" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient-violet">Organizations</h1>
            <p className="text-sm text-muted-foreground/60 mt-0.5">
              {result.total} {result.total === 1 ? 'organization' : 'organizations'}
              {search && ` matching "${search}"`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton entity="organizations" />
          <OrgCreateButton />
        </div>
      </div>

      {/* Gradient separator */}
      <div
        className="relative z-10 h-px animate-fade-in animate-delay-1"
        style={{
          background:
            'linear-gradient(90deg, oklch(0.65 0.24 280 / 20%), oklch(0.65 0.24 280 / 5%), transparent)',
        }}
      />

      {/* Search */}
      <div className="relative z-10 animate-fade-in animate-delay-1">
        <Suspense fallback={null}>
          <SearchForm
            defaultValue={search}
            placeholder="Search organizations..."
          />
        </Suspense>
      </div>

      {/* List */}
      <div className="relative z-10 animate-fade-in animate-delay-2">
        <OrgList organizations={result.data} />
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
