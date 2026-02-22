'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAccountId } from '@/lib/queries/account'
import type { ActionState } from '@/lib/types/app'

const ContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required').trim(),
  last_name: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email address').trim().optional().or(z.literal('')).transform((v) => v || null),
  phone: z.string().trim().optional().nullable(),
  title: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  tags: z.array(z.string()).default([]),
  organization_ids: z.array(z.string()).default([]),
})

export async function createContact(
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

  // Parse tags and org IDs from JSON-encoded hidden inputs
  let tags: string[] = []
  let organization_ids: string[] = []

  try {
    const tagsRaw = formData.get('tags')
    if (tagsRaw) tags = JSON.parse(tagsRaw as string)
  } catch {
    tags = []
  }

  try {
    const orgsRaw = formData.get('organization_ids')
    if (orgsRaw) organization_ids = JSON.parse(orgsRaw as string)
  } catch {
    organization_ids = []
  }

  const raw = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email') || '',
    phone: formData.get('phone') || null,
    title: formData.get('title') || null,
    notes: formData.get('notes') || null,
    tags,
    organization_ids,
  }

  const parsed = ContactSchema.safeParse(raw)
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

  // Insert contact row
  const { data: contact, error: insertError } = await supabase
    .from('contacts')
    .insert({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      title: parsed.data.title,
      notes: parsed.data.notes,
      tags: parsed.data.tags.length > 0 ? parsed.data.tags : null,
      account_id: accountId,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !contact) {
    console.error('createContact error:', insertError)
    return { error: insertError?.message ?? 'Failed to create contact' }
  }

  // Insert contact_organizations junction rows
  if (parsed.data.organization_ids.length > 0) {
    const junctionRows = parsed.data.organization_ids.map((orgId, idx) => ({
      contact_id: contact.id,
      organization_id: orgId,
      is_primary: idx === 0,
    }))

    const { error: junctionError } = await supabase
      .from('contact_organizations')
      .insert(junctionRows)

    if (junctionError) {
      console.error('createContact junction error:', junctionError)
      // Don't fail the whole operation — contact was created
    }
  }

  revalidatePath('/contacts')
  return { success: 'Contact created successfully.' }
}

export async function updateContact(
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
  if (!id) {
    return { error: 'Contact ID is required for updates' }
  }

  let tags: string[] = []
  let organization_ids: string[] = []

  try {
    const tagsRaw = formData.get('tags')
    if (tagsRaw) tags = JSON.parse(tagsRaw as string)
  } catch {
    tags = []
  }

  try {
    const orgsRaw = formData.get('organization_ids')
    if (orgsRaw) organization_ids = JSON.parse(orgsRaw as string)
  } catch {
    organization_ids = []
  }

  const raw = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email') || '',
    phone: formData.get('phone') || null,
    title: formData.get('title') || null,
    notes: formData.get('notes') || null,
    tags,
    organization_ids,
  }

  const parsed = ContactSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  // Update contact row
  const { error: updateError } = await supabase
    .from('contacts')
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      title: parsed.data.title,
      notes: parsed.data.notes,
      tags: parsed.data.tags.length > 0 ? parsed.data.tags : null,
      updated_by: user.id,
    })
    .eq('id', id)

  if (updateError) {
    console.error('updateContact error:', updateError)
    return { error: updateError.message }
  }

  // Re-sync organization links: delete existing, re-insert
  await supabase.from('contact_organizations').delete().eq('contact_id', id)

  if (parsed.data.organization_ids.length > 0) {
    const junctionRows = parsed.data.organization_ids.map((orgId, idx) => ({
      contact_id: id,
      organization_id: orgId,
      is_primary: idx === 0,
    }))

    await supabase.from('contact_organizations').insert(junctionRows)
  }

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  return { success: 'Contact updated successfully.' }
}

export async function deleteContact(id: string): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('contacts')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) {
    console.error('deleteContact error:', error)
    return { error: error.message }
  }

  revalidatePath('/contacts')
  return { success: 'Contact deleted.' }
}
