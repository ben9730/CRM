'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAccountId } from '@/lib/queries/account'
import type { ActionState } from '@/lib/types/app'

const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().optional()
  ),
  due_date: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().optional()
  ),
  priority: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.enum(['low', 'normal', 'high']).optional()
  ),
  contact_id: z.preprocess(
    (v) => (v === '' || v === '__none__' || v === null || v === undefined ? undefined : v),
    z.string().uuid('Invalid contact').optional()
  ),
  deal_id: z.preprocess(
    (v) => (v === '' || v === '__none__' || v === null || v === undefined ? undefined : v),
    z.string().uuid('Invalid deal').optional()
  ),
})

/**
 * Create a new task.
 */
export async function createTask(
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
    description: formData.get('description'),
    due_date: formData.get('due_date'),
    priority: formData.get('priority'),
    contact_id: formData.get('contact_id'),
    deal_id: formData.get('deal_id'),
  }

  const parsed = TaskSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  const { title, description, due_date, priority, contact_id, deal_id } = parsed.data

  let accountId: string
  try {
    accountId = await getAccountId(supabase, user.id)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Account not found' }
  }

  // If contact_id provided, get their primary org
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

  const { error } = await supabase.from('tasks').insert({
    account_id: accountId,
    created_by: user.id,
    assignee_id: user.id,
    title,
    description: description ?? null,
    due_date: due_date ?? null,
    priority: priority ?? null,
    contact_id: contact_id ?? null,
    deal_id: deal_id ?? null,
    organization_id,
    is_complete: false,
  })

  if (error) {
    console.error('createTask error:', error)
    return { error: 'Failed to create task. Please try again.' }
  }

  revalidatePath('/tasks')
  if (contact_id) revalidatePath(`/contacts/${contact_id}`)
  if (deal_id) revalidatePath(`/deals/${deal_id}`)
  revalidatePath('/dashboard')

  return { success: 'Task created successfully.' }
}

/**
 * Update an existing task.
 */
export async function updateTask(
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
  if (!id) return { error: 'Missing task ID' }

  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    due_date: formData.get('due_date'),
    priority: formData.get('priority'),
    contact_id: formData.get('contact_id'),
    deal_id: formData.get('deal_id'),
  }

  const parsed = TaskSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed'
    return { error: firstError }
  }

  const { title, description, due_date, priority, contact_id, deal_id } = parsed.data

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
    .from('tasks')
    .update({
      title,
      description: description ?? null,
      due_date: due_date ?? null,
      priority: priority ?? null,
      contact_id: contact_id ?? null,
      deal_id: deal_id ?? null,
      organization_id,
      updated_by: user.id,
    })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    console.error('updateTask error:', error)
    return { error: 'Failed to update task. Please try again.' }
  }

  revalidatePath('/tasks')
  if (contact_id) revalidatePath(`/contacts/${contact_id}`)
  if (deal_id) revalidatePath(`/deals/${deal_id}`)
  revalidatePath('/dashboard')

  return { success: 'Task updated successfully.' }
}

/**
 * Toggle task completion status.
 * If incomplete: marks complete with completed_at = now
 * If complete: marks incomplete, clears completed_at
 */
export async function completeTask(
  taskId: string,
  currentIsComplete: boolean
): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('contact_id, deal_id')
    .eq('id', taskId)
    .is('deleted_at', null)
    .maybeSingle()

  if (fetchError || !task) {
    return { error: 'Task not found' }
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      is_complete: !currentIsComplete,
      completed_at: currentIsComplete ? null : new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', taskId)
    .is('deleted_at', null)

  if (error) {
    console.error('completeTask error:', error)
    return { error: 'Failed to update task. Please try again.' }
  }

  revalidatePath('/tasks')
  if (task.contact_id) revalidatePath(`/contacts/${task.contact_id}`)
  if (task.deal_id) revalidatePath(`/deals/${task.deal_id}`)
  revalidatePath('/dashboard')

  return { success: currentIsComplete ? 'Task reopened.' : 'Task completed!' }
}

/**
 * Soft-delete a task.
 */
export async function deleteTask(id: string): Promise<ActionState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch to know which paths to revalidate
  const { data: existing } = await supabase
    .from('tasks')
    .select('contact_id, deal_id')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  const { error } = await supabase
    .from('tasks')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    console.error('deleteTask error:', error)
    return { error: 'Failed to delete task. Please try again.' }
  }

  revalidatePath('/tasks')
  if (existing?.contact_id) revalidatePath(`/contacts/${existing.contact_id}`)
  if (existing?.deal_id) revalidatePath(`/deals/${existing.deal_id}`)
  revalidatePath('/dashboard')

  return { success: 'Task deleted.' }
}
