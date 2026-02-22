import { createClient } from '@/lib/supabase/server'
import type { InteractionWithRelations } from '@/lib/types/app'

interface PipelineStageMetric {
  id: string
  name: string
  color: string | null
  displayOrder: number
  count: number
  value: number
  isWon: boolean
  isLost: boolean
}

interface DashboardMetrics {
  totalDeals: number
  totalPipelineValue: number
  tasksDueToday: number
  overdueTaskCount: number
  pipelineByStage: PipelineStageMetric[]
  recentActivity: InteractionWithRelations[]
  upcomingTasks: {
    id: string
    title: string
    due_date: string | null
    priority: string | null
    is_complete: boolean
    isOverdue: boolean
  }[]
}

/**
 * Fetch all dashboard data in parallel.
 * Returns aggregated metrics for MetricsCards, PipelineSummary, TasksWidget, ActivityFeed.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [dealsResult, tasksResult, activityResult] = await Promise.all([
    // All active deals with stage info
    supabase
      .from('deals')
      .select('id, value, stage_id, pipeline_stages(id, name, color, display_order, is_won, is_lost)')
      .is('deleted_at', null),

    // All incomplete tasks with basic fields
    supabase
      .from('tasks')
      .select('id, title, due_date, is_complete, priority')
      .is('deleted_at', null)
      .eq('is_complete', false)
      .order('due_date', { ascending: true }),

    // Recent interactions for activity feed
    supabase
      .from('interactions')
      .select('*, contacts(id, first_name, last_name), deals(id, title)')
      .is('deleted_at', null)
      .order('occurred_at', { ascending: false })
      .limit(10),
  ])

  // --- Process deals ---
  const deals = dealsResult.data ?? []
  const dealError = dealsResult.error
  if (dealError) console.error('getDashboardMetrics deals error:', dealError)

  // Compute pipeline by stage
  const stageMap = new Map<string, PipelineStageMetric>()
  for (const deal of deals) {
    const stage = deal.pipeline_stages as {
      id: string
      name: string
      color: string | null
      display_order: number
      is_won: boolean
      is_lost: boolean
    } | null

    if (!stage) continue

    if (!stageMap.has(stage.id)) {
      stageMap.set(stage.id, {
        id: stage.id,
        name: stage.name,
        color: stage.color,
        displayOrder: stage.display_order,
        count: 0,
        value: 0,
        isWon: stage.is_won,
        isLost: stage.is_lost,
      })
    }

    const stageMetric = stageMap.get(stage.id)!
    stageMetric.count++
    stageMetric.value += deal.value ?? 0
  }

  const pipelineByStage = Array.from(stageMap.values()).sort(
    (a, b) => a.displayOrder - b.displayOrder
  )

  // Total pipeline value = non-lost deals
  const activePipelineDeals = deals.filter((d) => {
    const stage = d.pipeline_stages as { is_lost: boolean } | null
    return stage && !stage.is_lost
  })

  const totalDeals = activePipelineDeals.filter((d) => {
    const stage = d.pipeline_stages as { is_won: boolean; is_lost: boolean } | null
    return stage && !stage.is_won && !stage.is_lost
  }).length

  const totalPipelineValue = activePipelineDeals.reduce(
    (sum, d) => sum + (d.value ?? 0),
    0
  )

  // --- Process tasks ---
  const tasks = tasksResult.data ?? []
  if (tasksResult.error) console.error('getDashboardMetrics tasks error:', tasksResult.error)

  const tasksDueToday = tasks.filter((t) => t.due_date === today).length
  const overdueTaskCount = tasks.filter(
    (t) => t.due_date && t.due_date < today
  ).length

  // Upcoming tasks: due today or in future, next 6
  const upcomingTasks = tasks
    .filter((t) => !t.due_date || t.due_date >= today)
    .slice(0, 6)
    .map((t) => ({
      ...t,
      isOverdue: false,
    }))

  // --- Process activity ---
  const activityData = activityResult.data ?? []
  if (activityResult.error)
    console.error('getDashboardMetrics activity error:', activityResult.error)

  const recentActivity: InteractionWithRelations[] = activityData.map((row) => {
    const raw = row as typeof row & {
      contacts: { id: string; first_name: string; last_name: string } | null
      deals: { id: string; title: string } | null
    }
    return {
      ...raw,
      contacts: raw.contacts ?? null,
      deals: raw.deals ?? null,
    } as InteractionWithRelations
  })

  return {
    totalDeals,
    totalPipelineValue,
    tasksDueToday,
    overdueTaskCount,
    pipelineByStage,
    recentActivity,
    upcomingTasks,
  }
}
