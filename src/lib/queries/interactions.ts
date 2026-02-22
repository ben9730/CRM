import { createClient } from '@/lib/supabase/server'
import type { InteractionWithRelations, PaginatedResult } from '@/lib/types/app'

const DEFAULT_PAGE_SIZE = 20

interface GetInteractionsOptions {
  page?: number
  pageSize?: number
}

/**
 * List all interactions with related contact and deal info, paginated.
 */
export async function getInteractions(
  options: GetInteractionsOptions = {}
): Promise<PaginatedResult<InteractionWithRelations>> {
  const supabase = await createClient()
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = options

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('interactions')
    .select('*, contacts(id, first_name, last_name), deals(id, title)', { count: 'exact' })
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getInteractions error:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const interactions = (data ?? []).map((row) => {
    const { contacts, deals, ...rest } = row as typeof row & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...rest,
      contacts: contacts ?? null,
      deals: deals ?? null,
    } as InteractionWithRelations
  })

  const total = count ?? 0
  return {
    data: interactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get all interactions for a specific contact, ordered by occurred_at DESC.
 */
export async function getInteractionsByContact(
  contactId: string
): Promise<InteractionWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('interactions')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .eq('contact_id', contactId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })

  if (error) {
    console.error('getInteractionsByContact error:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const { contacts, deals, ...rest } = row as typeof row & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...rest,
      contacts: contacts ?? null,
      deals: deals ?? null,
    } as InteractionWithRelations
  })
}

/**
 * Get all interactions for a specific deal, ordered by occurred_at DESC.
 */
export async function getInteractionsByDeal(
  dealId: string
): Promise<InteractionWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('interactions')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })

  if (error) {
    console.error('getInteractionsByDeal error:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const { contacts, deals, ...rest } = row as typeof row & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...rest,
      contacts: contacts ?? null,
      deals: deals ?? null,
    } as InteractionWithRelations
  })
}

/**
 * Get the most recent N interactions across all records (for dashboard activity feed).
 */
export async function getRecentInteractions(
  limit = 10
): Promise<InteractionWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('interactions')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentInteractions error:', error)
    return []
  }

  return (data ?? []).map((row) => {
    const { contacts, deals, ...rest } = row as typeof row & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...rest,
      contacts: contacts ?? null,
      deals: deals ?? null,
    } as InteractionWithRelations
  })
}
