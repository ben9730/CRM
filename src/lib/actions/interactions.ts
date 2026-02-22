'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAccountId } from '@/lib/queries/account'
import type { ActionState } from '@/lib/types/app'

const InteractionSchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note']).refine((v) => v !== undefined, {
    message: 'Interaction type is required',
  }),
  subject: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().max(255).optional()
  ),
  body: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().optional()
  ),
  occurred_at: z.string().min(1, 'Date/time is required'),
  duration_mins: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  contact_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().uuid('Invalid contact').optional()
  ),
  deal_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().uuid('Invalid deal').optional()
  ),
})

/**
 * Create a new interaction log entry.
 */
export async function createInteraction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const raw = {
    type: formData.get('type'),
    subject: formData.get('subject'),
    body: formData.get('body'),
    occurred_at: formData.get('occurred_at'),
    duration_mins: formData.get('duration_mins'),
    contact_id: formData.get('contact_id'),
    deal_id: formData.get('deal_id'),
  }

  const parsed = InteractionSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  const { type, subject, body, occurred_at, duration_mins, contact_id, deal_id } = parsed.data

  let accountId: string
  try {
    accountId = await getAccountId(supabase, user.id)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Account not found' }
  }

  // If contact_id is provided, look up their primary organization for organization_id
  let organization_id: string | null = null
  if (contact_id) {
    const { data: orgLink } = await supabase
      .from('contact_organizations')
      .select('organization_id')
      .eq('contact_id', contact_id)
      .eq('is_primary', true)
      .maybeSingle()

    organization_id = orgLink?.organization_id ?? null
  }

  const { error } = await supabase.from('interactions').insert({
    account_id: accountId,
    user_id: user.id,
    type,
    subject: subject ?? null,
    body: body ?? null,
    occurred_at,
    duration_mins: duration_mins ?? null,
    contact_id: contact_id ?? null,
    deal_id: deal_id ?? null,
    organization_id,
  })

  if (error) {
    console.error('createInteraction error:', error)
    return { error: 'Failed to log interaction. Please try again.' }
  }

  revalidatePath('/interactions')
  if (contact_id) revalidatePath(`/contacts/${contact_id}`)
  if (deal_id) revalidatePath(`/deals/${deal_id}`)

  return { success: 'Interaction logged successfully.' }
}

/**
 * Update an existing interaction.
 */
export async function updateInteraction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const id = formData.get('id') as string
  if (!id) return { error: 'Missing interaction ID' }

  const raw = {
    type: formData.get('type'),
    subject: formData.get('subject'),
    body: formData.get('body'),
    occurred_at: formData.get('occurred_at'),
    duration_mins: formData.get('duration_mins'),
    contact_id: formData.get('contact_id'),
    deal_id: formData.get('deal_id'),
  }

  const parsed = InteractionSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  const { type, subject, body, occurred_at, duration_mins, contact_id, deal_id } = parsed.data

  // If contact_id changed, update organization_id
  let organization_id: string | null = null
  if (contact_id) {
    const { data: orgLink } = await supabase
      .from('contact_organizations')
      .select('organization_id')
      .eq('contact_id', contact_id)
      .eq('is_primary', true)
      .maybeSingle()

    organization_id = orgLink?.organization_id ?? null
  }

  const { error } = await supabase
    .from('interactions')
    .update({
      type,
      subject: subject ?? null,
      body: body ?? null,
      occurred_at,
      duration_mins: duration_mins ?? null,
      contact_id: contact_id ?? null,
      deal_id: deal_id ?? null,
      organization_id,
    })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    console.error('updateInteraction error:', error)
    return { error: 'Failed to update interaction. Please try again.' }
  }

  revalidatePath('/interactions')
  if (contact_id) revalidatePath(`/contacts/${contact_id}`)
  if (deal_id) revalidatePath(`/deals/${deal_id}`)

  return { success: 'Interaction updated successfully.' }
}

/**
 * Soft-delete an interaction.
 */
export async function deleteInteraction(id: string): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch to know which contact/deal to revalidate
  const { data: existing } = await supabase
    .from('interactions')
    .select('contact_id, deal_id')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  const { error } = await supabase
    .from('interactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    console.error('deleteInteraction error:', error)
    return { error: 'Failed to delete interaction. Please try again.' }
  }

  revalidatePath('/interactions')
  if (existing?.contact_id) revalidatePath(`/contacts/${existing.contact_id}`)
  if (existing?.deal_id) revalidatePath(`/deals/${existing.deal_id}`)
  revalidatePath('/dashboard')

  return { success: 'Interaction deleted.' }
}
