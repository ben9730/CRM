import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getContacts } from '@/lib/queries/contacts'
import { getOrganizations } from '@/lib/queries/organizations'
import { Users, Building2, TrendingUp, Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  if (!query) {
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
        <div className="relative z-10 flex items-start gap-3 animate-fade-in">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
            style={{
              background:
                'linear-gradient(135deg, oklch(0.65 0.24 280 / 20%), oklch(0.55 0.24 300 / 20%))',
              boxShadow: '0 0 16px -4px oklch(0.65 0.24 280 / 20%)',
              border: '1px solid oklch(0.65 0.24 280 / 15%)',
            }}
          >
            <Search className="h-5 w-5 text-primary/80" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient-violet">Search</h1>
            <p className="text-sm text-muted-foreground/60 mt-0.5">
              Search for contacts, deals, and organizations
            </p>
          </div>
        </div>

        {/* Empty state */}
        <div className="relative z-10 flex flex-col items-center justify-center py-20 animate-fade-in animate-delay-1">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{
              background:
                'linear-gradient(135deg, oklch(0.65 0.24 280 / 10%), oklch(0.55 0.24 300 / 10%))',
              border: '1px solid oklch(0.65 0.24 280 / 15%)',
            }}
          >
            <Search className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground/50 text-sm">
            Use the search bar above to find contacts, deals, and organizations
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  // Parallel search across all three entities
  const [contactsResult, orgsResult, dealsResult] = await Promise.all([
    getContacts({ search: query, page: 1, pageSize: 20 }),
    getOrganizations({ search: query, page: 1, pageSize: 20 }),
    supabase
      .from('deals')
      .select('id, title, value, currency, pipeline_stages(name), organizations(name)')
      .ilike('title', `%${query}%`)
      .is('deleted_at', null)
      .limit(20),
  ])

  const contacts = contactsResult.data
  const orgs = orgsResult.data
  const deals = (dealsResult.data ?? []).map((d) => {
    const stage = d.pipeline_stages as { name: string } | null
    const org = d.organizations as { name: string } | null
    return {
      id: d.id,
      title: d.title,
      value: d.value,
      currency: d.currency,
      stage_name: stage?.name ?? '',
      org_name: org?.name ?? '',
    }
  })

  const totalResults = contacts.length + orgs.length + deals.length

  function formatValue(value: number | null, currency: string | null) {
    if (!value) return null
    const cur = currency ?? 'USD'
    if (value >= 1_000_000) return `${cur} ${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `${cur} ${(value / 1_000).toFixed(0)}K`
    return `${cur} ${value.toLocaleString()}`
  }

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
      <div className="relative z-10 flex items-start gap-3 animate-fade-in">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.65 0.24 280 / 20%), oklch(0.55 0.24 300 / 20%))',
            boxShadow: '0 0 16px -4px oklch(0.65 0.24 280 / 20%)',
            border: '1px solid oklch(0.65 0.24 280 / 15%)',
          }}
        >
          <Search className="h-5 w-5 text-primary/80" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient-violet">
            Search results
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-0.5">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} for &quot;{query}&quot;
          </p>
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

      {totalResults === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center py-20 animate-fade-in animate-delay-1">
          <p className="text-muted-foreground/50 text-sm">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-8 animate-fade-in animate-delay-1">

          {/* Contacts section */}
          {contacts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary/70" />
                <h2 className="text-sm font-semibold text-foreground/80">Contacts</h2>
                <span className="text-xs text-muted-foreground/50 ml-1">({contacts.length})</span>
              </div>
              <div className="space-y-1">
                {contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold flex-shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, oklch(0.65 0.24 280 / 20%), oklch(0.55 0.24 300 / 20%))',
                          color: 'oklch(0.75 0.20 280)',
                        }}
                      >
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground/90 group-hover:text-foreground">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {(contact.title || contact.email) && (
                          <p className="text-xs text-muted-foreground/60">
                            {contact.title ?? contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                    {contact.organizations.length > 0 && (
                      <span className="text-xs text-muted-foreground/50 hidden sm:block">
                        {contact.organizations[0].name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Organizations section */}
          {orgs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary/70" />
                <h2 className="text-sm font-semibold text-foreground/80">Organizations</h2>
                <span className="text-xs text-muted-foreground/50 ml-1">({orgs.length})</span>
              </div>
              <div className="space-y-1">
                {orgs.map((org) => (
                  <Link
                    key={org.id}
                    href={`/organizations/${org.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, oklch(0.55 0.20 260 / 20%), oklch(0.50 0.20 280 / 20%))',
                        }}
                      >
                        <Building2 className="h-4 w-4" style={{ color: 'oklch(0.70 0.18 270)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground/90 group-hover:text-foreground">
                          {org.name}
                        </p>
                        {org.type && (
                          <p className="text-xs text-muted-foreground/60">{org.type}</p>
                        )}
                      </div>
                    </div>
                    {org.city && (
                      <span className="text-xs text-muted-foreground/50 hidden sm:block">
                        {org.city}{org.state ? `, ${org.state}` : ''}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Deals section */}
          {deals.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary/70" />
                <h2 className="text-sm font-semibold text-foreground/80">Deals</h2>
                <span className="text-xs text-muted-foreground/50 ml-1">({deals.length})</span>
              </div>
              <div className="space-y-1">
                {deals.map((deal) => {
                  const formattedValue = formatValue(deal.value, deal.currency)
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                          style={{
                            background:
                              'linear-gradient(135deg, oklch(0.60 0.22 300 / 20%), oklch(0.55 0.24 320 / 20%))',
                          }}
                        >
                          <TrendingUp className="h-4 w-4" style={{ color: 'oklch(0.70 0.20 300)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-foreground">
                            {deal.title}
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            {[deal.stage_name, deal.org_name].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                      {formattedValue && (
                        <span className="text-xs font-medium text-gradient-violet hidden sm:block">
                          {formattedValue}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
