import { createClient } from '@/lib/supabase/server'
import type { OrgRow, OrgWithRelations, PaginatedResult } from '@/lib/types/app'

const DEFAULT_PAGE_SIZE = 20

interface GetOrganizationsOptions {
  search?: string
  page?: number
  pageSize?: number
}

/**
 * List organizations with optional full-text search and pagination.
 * Filters deleted records via .is('deleted_at', null).
 */
export async function getOrganizations(
  options: GetOrganizationsOptions = {}
): Promise<PaginatedResult<OrgRow>> {
  const supabase = await createClient()
  const { search, page = 1, pageSize = DEFAULT_PAGE_SIZE } = options

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('organizations')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('name')
    .range(from, to)

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'websearch' })
  }

  const { data, error, count } = await query

  if (error) {
    console.error('getOrganizations error:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const total = count ?? 0

  return {
    data: data ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get a single organization by ID with contact and deal counts.
 */
export async function getOrganization(id: string): Promise<OrgWithRelations | null> {
  const supabase = await createClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !org) return null

  // Count linked non-deleted contacts
  const { count: contactCount } = await supabase
    .from('contact_organizations')
    .select('contact_id', { count: 'exact', head: true })
    .eq('organization_id', id)

  // Count linked non-deleted deals
  const { count: dealCount } = await supabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', id)
    .is('deleted_at', null)

  return {
    ...org,
    contact_count: contactCount ?? 0,
    deal_count: dealCount ?? 0,
  }
}

/**
 * Get all non-deleted contacts linked to an organization.
 */
export async function getOrganizationContacts(orgId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_organizations')
    .select('is_primary, contacts(id, first_name, last_name, title, email, phone, tags, deleted_at)')
    .eq('organization_id', orgId)

  if (error || !data) return []

  // Filter out deleted contacts in application code
  return data
    .filter((row) => {
      const contact = row.contacts as {
        deleted_at: string | null
        id: string
        first_name: string
        last_name: string
        title: string | null
        email: string | null
        phone: string | null
        tags: string[] | null
      } | null
      return contact && !contact.deleted_at
    })
    .map((row) => {
      const contact = row.contacts as {
        id: string
        first_name: string
        last_name: string
        title: string | null
        email: string | null
        phone: string | null
        tags: string[] | null
        deleted_at: string | null
      }
      return {
        id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        title: contact.title,
        email: contact.email,
        phone: contact.phone,
        tags: contact.tags,
        is_primary: row.is_primary,
      }
    })
}

/**
 * Get all non-deleted deals linked to an organization.
 */
export async function getOrganizationDeals(orgId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .select('id, title, value, currency, stage_id, expected_close, pipeline_stages(name, color)')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((deal) => {
    const stage = deal.pipeline_stages as { name: string; color: string | null } | null
    return {
      id: deal.id,
      title: deal.title,
      value: deal.value,
      currency: deal.currency,
      expected_close: deal.expected_close,
      stage_name: stage?.name ?? 'Unknown',
      stage_color: stage?.color ?? null,
    }
  })
}

/**
 * Get a minimal list of organizations for dropdowns/selects.
 */
export async function getOrganizationsList(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name')
    .is('deleted_at', null)
    .order('name')

  if (error || !data) return []
  return data
}
