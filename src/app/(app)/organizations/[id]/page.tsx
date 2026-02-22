import { notFound } from 'next/navigation'
import { getOrganization, getOrganizationContacts, getOrganizationDeals } from '@/lib/queries/organizations'
import { OrgDetailView } from '@/components/organizations/org-detail-view'

interface OrgDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrgDetailPage({ params }: OrgDetailPageProps) {
  const { id } = await params

  const [org, contacts, deals] = await Promise.all([
    getOrganization(id),
    getOrganizationContacts(id),
    getOrganizationDeals(id),
  ])

  if (!org) {
    notFound()
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.65 0.24 280 / 5%) 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10">
        <OrgDetailView org={org} contacts={contacts} deals={deals} />
      </div>
    </div>
  )
}
