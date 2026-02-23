'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAccountId } from '@/lib/queries/account'
import type { ActionState, DealWithRelations } from '@/lib/types/app'

const DealSchema = z.object({
  title: z.string().min(1, 'Deal title is required').trim(),
  stage_id: z.string().uuid('Invalid stage'),
  value: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0, 'Value must be non-negative').optional()
  ),
  expected_close: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.string().optional()
  ),
  organization_id: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.string().uuid('Invalid organization').optional()
  ),
  notes: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.string().optional()
  ),
})

/**
 * Create a new deal, optionally linking contacts via deal_contacts junction.
 */
export async function createDeal(
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
    title: formData.get('title'),
    stage_id: formData.get('stage_id'),
    value: formData.get('value'),
    expected_close: formData.get('expected_close'),
    organization_id: formData.get('organization_id'),
    notes: formData.get('notes'),
  }

  const parsed = DealSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  let accountId: string
  try {
    accountId = await getAccountId(supabase, user.id)
  } catch {
    return { error: 'Could not find your account. Please contact support.' }
  }

  const { data: deal, error: insertError } = await supabase
    .from('deals')
    .insert({
      title: parsed.data.title,
      stage_id: parsed.data.stage_id,
      value: parsed.data.value ?? null,
      expected_close: parsed.data.expected_close ?? null,
      organization_id: parsed.data.organization_id ?? null,
      notes: parsed.data.notes ?? null,
      account_id: accountId,
      created_by: user.id,
      updated_by: user.id,
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (insertError || !deal) {
    console.error('createDeal error:', insertError)
    return { error: insertError?.message ?? 'Failed to create deal' }
  }

  // Link contacts via deal_contacts junction
  const contactIdsRaw = formData.get('contact_ids')
  if (contactIdsRaw && typeof contactIdsRaw === 'string') {
    try {
      const contactIds: string[] = JSON.parse(contactIdsRaw)
      if (contactIds.length > 0) {
        const junctionRows = contactIds.map((contactId) => ({
          deal_id: deal.id,
          contact_id: contactId,
        }))
        const { error: junctionError } = await supabase
          .from('deal_contacts')
          .insert(junctionRows)

        if (junctionError) {
          console.error('createDeal deal_contacts error:', junctionError)
          // Don't fail the whole action — deal was created
        }
      }
    } catch {
      // Invalid JSON — skip contact linking
    }
  }

  // Fetch the newly created deal with relations for optimistic Kanban update
  const { data: newDeal } = await supabase
    .from('deals')
    .select('*, pipeline_stages(id, name, color, display_order, is_won, is_lost), organizations(id, name)')
    .eq('id', deal.id)
    .single()

  revalidatePath('/deals')

  if (newDeal) {
    return { success: 'Deal created successfully.', deal: newDeal as DealWithRelations }
  }
  return { success: 'Deal created successfully.' }
}

/**
 * Update an existing deal's fields and re-sync linked contacts.
 */
export async function updateDeal(
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

  const id = formData.get('id')
  if (!id || typeof id !== 'string') {
    return { error: 'Deal ID is required for update' }
  }

  const raw = {
    title: formData.get('title'),
    stage_id: formData.get('stage_id'),
    value: formData.get('value'),
    expected_close: formData.get('expected_close'),
    organization_id: formData.get('organization_id'),
    notes: formData.get('notes'),
  }

  const parsed = DealSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  const { error: updateError } = await supabase
    .from('deals')
    .update({
      title: parsed.data.title,
      stage_id: parsed.data.stage_id,
      value: parsed.data.value ?? null,
      expected_close: parsed.data.expected_close ?? null,
      organization_id: parsed.data.organization_id ?? null,
      notes: parsed.data.notes ?? null,
      updated_by: user.id,
    })
    .eq('id', id)

  if (updateError) {
    console.error('updateDeal error:', updateError)
    return { error: updateError.message }
  }

  // Re-sync contacts: delete old links, insert new ones
  const contactIdsRaw = formData.get('contact_ids')
  if (contactIdsRaw !== null && typeof contactIdsRaw === 'string') {
    // Delete all existing links for this deal
    await supabase.from('deal_contacts').delete().eq('deal_id', id)

    try {
      const contactIds: string[] = JSON.parse(contactIdsRaw)
      if (contactIds.length > 0) {
        const junctionRows = contactIds.map((contactId) => ({
          deal_id: id,
          contact_id: contactId,
        }))
        await supabase.from('deal_contacts').insert(junctionRows)
      }
    } catch {
      // Invalid JSON — skip contact linking
    }
  }

  revalidatePath('/deals')
  revalidatePath(`/deals/${id}`)
  return { success: 'Deal updated successfully.' }
}

/**
 * Soft-delete a deal by setting deleted_at.
 */
export async function deleteDeal(id: string): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('deals')
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

  if (error) {
    console.error('deleteDeal error:', error)
    return { error: error.message }
  }

  revalidatePath('/deals')
  return { success: 'Deal deleted.' }
}

/**
 * Lightweight action to move a deal to a new pipeline stage.
 * Used by KanbanBoard drag-and-drop for optimistic updates.
 * Returns { error?: string } — non-null error triggers optimistic rollback.
 */
export async function moveDealStage(
  dealId: string,
  newStageId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('deals')
    .update({ stage_id: newStageId, updated_by: user.id })
    .eq('id', dealId)

  if (error) {
    console.error('moveDealStage error:', error)
    return { error: error.message }
  }

  revalidatePath('/deals')
  return {}
}
