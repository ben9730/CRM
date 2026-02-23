import { createClient } from '@/lib/supabase/server'
import { getLocalToday } from '@/lib/utils'
import type { TaskWithRelations, PaginatedResult } from '@/lib/types/app'

const DEFAULT_PAGE_SIZE = 20

interface GetTasksOptions {
  status?: 'pending' | 'completed' | 'overdue'
  page?: number
  pageSize?: number
}

/**
 * List all tasks with optional status filter and pagination.
 * Computes isOverdue for each task.
 */
export async function getTasks(
  options: GetTasksOptions = {}
): Promise<PaginatedResult<TaskWithRelations>> {
  const supabase = await createClient()
  const { status, page = 1, pageSize = DEFAULT_PAGE_SIZE } = options

  const today = getLocalToday()

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('tasks')
    .select('*, contacts(id, first_name, last_name), deals(id, title)', { count: 'exact' })
    .is('deleted_at', null)
    .order('due_date', { ascending: true })
    .range(from, to)

  if (status === 'completed') {
    query = query.eq('is_complete', true)
  } else if (status === 'overdue') {
    query = query.eq('is_complete', false).lt('due_date', today)
  } else if (status === 'pending') {
    // Pending = incomplete and either no due date or not overdue
    query = query.eq('is_complete', false)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('getTasks error:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  let tasks = (data ?? []).map((task) => {
    const raw = task as typeof task & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...raw,
      contacts: raw.contacts ?? null,
      deals: raw.deals ?? null,
      isOverdue: !raw.is_complete && !!raw.due_date && raw.due_date < today,
    } as TaskWithRelations
  })

  // For 'pending' filter: exclude overdue tasks (they appear under 'overdue')
  if (status === 'pending') {
    tasks = tasks.filter((t) => !t.isOverdue)
  }

  const total = count ?? 0
  return {
    data: tasks,
    total: status === 'pending' ? tasks.length : total,
    page,
    pageSize,
    totalPages: Math.ceil((status === 'pending' ? tasks.length : total) / pageSize),
  }
}

/**
 * Get all tasks for a specific contact, with isOverdue computed.
 */
export async function getTasksByContact(contactId: string): Promise<TaskWithRelations[]> {
  const supabase = await createClient()
  const today = getLocalToday()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .eq('contact_id', contactId)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('getTasksByContact error:', error)
    return []
  }

  return (data ?? []).map((task) => {
    const raw = task as typeof task & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...raw,
      contacts: raw.contacts ?? null,
      deals: raw.deals ?? null,
      isOverdue: !raw.is_complete && !!raw.due_date && raw.due_date < today,
    } as TaskWithRelations
  })
}

/**
 * Get all tasks for a specific deal, with isOverdue computed.
 */
export async function getTasksByDeal(dealId: string): Promise<TaskWithRelations[]> {
  const supabase = await createClient()
  const today = getLocalToday()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('getTasksByDeal error:', error)
    return []
  }

  return (data ?? []).map((task) => {
    const raw = task as typeof task & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...raw,
      contacts: raw.contacts ?? null,
      deals: raw.deals ?? null,
      isOverdue: !raw.is_complete && !!raw.due_date && raw.due_date < today,
    } as TaskWithRelations
  })
}

/**
 * Get tasks due today that are incomplete.
 */
export async function getTasksDueToday(): Promise<TaskWithRelations[]> {
  const supabase = await createClient()
  const today = getLocalToday()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, contacts(id, first_name, last_name), deals(id, title)')
    .eq('due_date', today)
    .eq('is_complete', false)
    .is('deleted_at', null)
    .order('priority')

  if (error) {
    console.error('getTasksDueToday error:', error)
    return []
  }

  return (data ?? []).map((task) => {
    const raw = task as typeof task & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...raw,
      contacts: raw.contacts ?? null,
      deals: raw.deals ?? null,
      isOverdue: false, // due today = not overdue yet
    } as TaskWithRelations
  })
}

/**
 * Get count of overdue incomplete tasks (for sidebar badge).
 */
export async function getOverdueTaskCount(): Promise<number> {
  const supabase = await createClient()
  const today = getLocalToday()

  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('is_complete', false)
    .lt('due_date', today)
    .is('deleted_at', null)

  if (error) {
    console.error('getOverdueTaskCount error:', error)
    return 0
  }

  return count ?? 0
}
