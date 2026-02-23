import { createClient } from '@/lib/supabase/server'
import { getLocalToday, toDateOnly } from '@/lib/utils'
import type { ContactWithOrgs, InteractionWithRelations, PaginatedResult, TaskWithRelations } from '@/lib/types/app'

const DEFAULT_PAGE_SIZE = 20

interface GetContactsOptions {
  search?: string
  tag?: string
  orgId?: string
  page?: number
  pageSize?: number
}

/**
 * List contacts with optional full-text search, tag filter, org filter, and pagination.
 * Uses .is('deleted_at', null) for PostgREST NULL handling.
 */
export async function getContacts(
  options: GetContactsOptions = {}
): Promise<PaginatedResult<ContactWithOrgs>> {
  const supabase = await createClient()
  const { search, tag, orgId, page = 1, pageSize = DEFAULT_PAGE_SIZE } = options

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('contacts')
    .select(
      '*, contact_organizations(is_primary, organizations(id, name))',
      { count: 'exact' }
    )
    .is('deleted_at', null)
    .order('last_name')
    .range(from, to)

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'websearch' })
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error, count } = await query

  if (error) {
    console.error('getContacts error:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Transform nested org data and apply orgId filter in application code
  let contacts = (data ?? []).map((row) => {
    const orgLinks = (row.contact_organizations ?? []) as {
      is_primary: boolean
      organizations: { id: string; name: string } | null
    }[]

    const organizations = orgLinks
      .filter((link) => link.organizations !== null)
      .map((link) => ({
        id: link.organizations!.id,
        name: link.organizations!.name,
        is_primary: link.is_primary,
      }))

    const { contact_organizations: _, ...rest } = row as typeof row & { contact_organizations: unknown }
    return {
      ...rest,
      organizations,
    } as ContactWithOrgs
  })

  // Filter by orgId in application code
  if (orgId) {
    contacts = contacts.filter((c) => c.organizations.some((o) => o.id === orgId))
  }

  const total = orgId ? contacts.length : (count ?? 0)

  return {
    data: contacts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get a single contact with all linked data.
 */
export async function getContact(id: string): Promise<ContactWithOrgs | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('*, contact_organizations(is_primary, organizations(id, name))')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) return null

  const orgLinks = (data.contact_organizations ?? []) as {
    is_primary: boolean
    organizations: { id: string; name: string } | null
  }[]

  const organizations = orgLinks
    .filter((link) => link.organizations !== null)
    .map((link) => ({
      id: link.organizations!.id,
      name: link.organizations!.name,
      is_primary: link.is_primary,
    }))

  const { contact_organizations: _, ...rest } = data as typeof data & { contact_organizations: unknown }
  return { ...rest, organizations } as ContactWithOrgs
}

/**
 * Get linked deals for a contact.
 */
export async function getContactDeals(contactId: string) {
  const supabase = await createClient()

  // Deals are linked to contacts via organization — find deals where the contact's orgs match
  // But first check if there's a direct contact_id on deals (there isn't in this schema)
  // We use organization-level linking: find orgs the contact belongs to, then their deals
  const { data: orgLinks } = await supabase
    .from('contact_organizations')
    .select('organization_id')
    .eq('contact_id', contactId)

  if (!orgLinks || orgLinks.length === 0) return []

  const orgIds = orgLinks.map((l) => l.organization_id)

  const { data, error } = await supabase
    .from('deals')
    .select('id, title, value, currency, stage_id, expected_close, pipeline_stages(name, color)')
    .in('organization_id', orgIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

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
 * Get linked tasks for a contact, with isOverdue computed.
 */
export async function getContactTasks(contactId: string): Promise<TaskWithRelations[]> {
  const supabase = await createClient()

  const today = getLocalToday()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .eq('contact_id', contactId)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error || !data) return []

  return data.map((task) => {
    const raw = task as typeof task & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...raw,
      contacts: raw.contacts ?? null,
      deals: raw.deals ?? null,
      isOverdue: !raw.is_complete && !!raw.due_date && toDateOnly(raw.due_date) < today,
    } as TaskWithRelations
  })
}

/**
 * Get linked interactions for a contact, with full relations.
 */
export async function getContactInteractions(
  contactId: string
): Promise<InteractionWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('interactions')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .eq('contact_id', contactId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => {
    const raw = row as typeof row & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...raw,
      contacts: raw.contacts ?? null,
      deals: raw.deals ?? null,
    } as InteractionWithRelations
  })
}

/**
 * Get all available tags across contacts for the filter dropdown.
 */
export async function getAvailableTags(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('tags')
    .is('deleted_at', null)
    .not('tags', 'is', null)

  if (error || !data) return []

  const tagSet = new Set<string>()
  data.forEach((row) => {
    ;(row.tags ?? []).forEach((tag) => tagSet.add(tag))
  })

  return Array.from(tagSet).sort()
}
