import type { Tables } from '@/types/database'

// Re-exports for convenience
export type OrgRow = Tables<'organizations'>
export type ContactRow = Tables<'contacts'>
export type DealRow = Tables<'deals'>
export type TaskRow = Tables<'tasks'>
export type InteractionRow = Tables<'interactions'>
export type PipelineStageRow = Tables<'pipeline_stages'>

// Contact with linked organizations via junction table
export type ContactWithOrgs = ContactRow & {
  organizations: {
    id: string
    name: string
    is_primary: boolean
  }[]
}

// Organization with aggregate counts
export type OrgWithRelations = OrgRow & {
  contact_count: number
  deal_count: number
}

// Generic paginated result wrapper
export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Generic server action state (matches AuthState pattern from auth.ts)
export type ActionState = { error?: string; success?: string } | undefined

// Deal with stage info for contact detail
export type DealWithStage = DealRow & {
  stage_name: string
  stage_color: string | null
}

// Task with contact/deal context
export type TaskWithContext = TaskRow

// Interaction row (already flat enough for display)
export type InteractionWithContext = InteractionRow
