import { createClient } from '@/lib/supabase/server'
import type { DealWithRelations } from '@/lib/types/app'

/**
 * Returns all active (non-deleted) deals with stage and organization joins.
 */
export async function getDeals(): Promise<DealWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .select('*, pipeline_stages(id, name, color, display_order, is_won, is_lost), organizations(id, name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getDeals error:', error)
    return []
  }

  return (data ?? []) as DealWithRelations[]
}

/**
 * Returns a single deal with full relations including linked contacts via deal_contacts.
 */
export async function getDeal(id: string): Promise<DealWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .select(
      '*, pipeline_stages(id, name, color, display_order, is_won, is_lost), organizations(id, name), deal_contacts(contact_id, role, contacts(id, first_name, last_name))'
    )
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('getDeal error:', error)
    return null
  }

  if (!data) return null

  // Reshape deal_contacts to a flat contacts array
  const rawContacts = (data as unknown as { deal_contacts: { contacts: { id: string; first_name: string; last_name: string } | null }[] }).deal_contacts ?? []
  const contacts = rawContacts
    .map((dc) => dc.contacts)
    .filter((c): c is { id: string; first_name: string; last_name: string } => c !== null)

  return {
    ...data,
    pipeline_stages: data.pipeline_stages as DealWithRelations['pipeline_stages'],
    organizations: data.organizations as DealWithRelations['organizations'],
    contacts,
  } as DealWithRelations
}

/**
 * Returns all active deals for a specific organization.
 */
export async function getDealsByOrganization(orgId: string): Promise<DealWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .select('*, pipeline_stages(id, name, color, display_order, is_won, is_lost), organizations(id, name)')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getDealsByOrganization error:', error)
    return []
  }

  return (data ?? []) as DealWithRelations[]
}

/**
 * Returns all active deals linked to a specific contact via deal_contacts.
 */
export async function getDealsByContact(contactId: string): Promise<DealWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deal_contacts')
    .select('deals(*, pipeline_stages(id, name, color, display_order, is_won, is_lost), organizations(id, name))')
    .eq('contact_id', contactId)

  if (error) {
    console.error('getDealsByContact error:', error)
    return []
  }

  // Flatten the nested structure
  const deals = (data ?? [])
    .map((row) => (row as unknown as { deals: DealWithRelations | null }).deals)
    .filter((d): d is DealWithRelations => d !== null && d.deleted_at === null)

  return deals
}
