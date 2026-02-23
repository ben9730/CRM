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
export type ActionState = { error?: string; success?: string; deal?: DealWithRelations } | undefined

// Deal with full relations for Kanban board and detail page
export type DealWithRelations = DealRow & {
  pipeline_stages: PipelineStageRow | null
  organizations: { id: string; name: string } | null
  contacts?: { id: string; first_name: string; last_name: string }[]
}

// Deal with stage info for contact detail (simpler variant used in contact page)
export type DealWithStage = DealRow & {
  stage_name: string
  stage_color: string | null
}

// Interaction with related contact and deal info
export type InteractionWithRelations = InteractionRow & {
  contacts?: { id: string; first_name: string; last_name: string } | null
  deals?: { id: string; title: string } | null
}

// Task with related contact and deal info, plus computed overdue flag
export type TaskWithRelations = TaskRow & {
  contacts?: { id: string; first_name: string; last_name: string } | null
  deals?: { id: string; title: string } | null
  isOverdue: boolean
}
