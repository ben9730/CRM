'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAccountId } from '@/lib/queries/account'
import type { ActionState } from '@/lib/types/app'

const ORG_TYPES = ['hospital', 'clinic', 'lab', 'other'] as const

const OrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required').trim(),
  type: z.enum(ORG_TYPES).optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  website: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
})

export async function createOrganization(
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
    name: formData.get('name'),
    type: formData.get('type') || null,
    phone: formData.get('phone') || null,
    website: formData.get('website') || null,
    address: formData.get('address') || null,
    city: formData.get('city') || null,
    state: formData.get('state') || null,
    notes: formData.get('notes') || null,
  }

  const parsed = OrgSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  let accountId: string
  try {
    accountId = await getAccountId(supabase, user.id)
  } catch (err) {
    return { error: 'Could not find your account. Please contact support.' }
  }

  const { error } = await supabase.from('organizations').insert({
    ...parsed.data,
    account_id: accountId,
    created_by: user.id,
    updated_by: user.id,
  })

  if (error) {
    console.error('createOrganization error:', error)
    return { error: error.message }
  }

  revalidatePath('/organizations')
  return { success: 'Organization created successfully.' }
}

export async function updateOrganization(
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
    return { error: 'Organization ID is required for updates' }
  }

  const raw = {
    name: formData.get('name'),
    type: formData.get('type') || null,
    phone: formData.get('phone') || null,
    website: formData.get('website') || null,
    address: formData.get('address') || null,
    city: formData.get('city') || null,
    state: formData.get('state') || null,
    notes: formData.get('notes') || null,
  }

  const parsed = OrgSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      ...parsed.data,
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) {
    console.error('updateOrganization error:', error)
    return { error: error.message }
  }

  revalidatePath('/organizations')
  revalidatePath(`/organizations/${id}`)
  return { success: 'Organization updated successfully.' }
}

export async function deleteOrganization(id: string): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) {
    console.error('deleteOrganization error:', error)
    return { error: error.message }
  }

  revalidatePath('/organizations')
  return { success: 'Organization deleted.' }
}
