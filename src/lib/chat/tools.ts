import { type FunctionDeclaration, type FunctionResponsePart, SchemaType } from '@google/generative-ai'
import { getAccountId } from '@/lib/queries/account'
import { getLocalToday, toDateOnly } from '@/lib/utils'

export const SYSTEM_PROMPT = `You are an AI assistant built into a B2B Health CRM. You help sales reps manage their pipeline, tasks, and contacts.
- Always respond in the same language the user writes in (Hebrew or English)
- Be concise and actionable
- When showing tasks, always mention priority and due date
- When showing deals, always mention value and stage
- Format responses cleanly with emojis for readability
- When creating a task, confirm what was created
- If a query returns no results, let the user know politely`

export const chatTools: FunctionDeclaration[] = [
  {
    name: 'get_urgent_tasks',
    description: 'Fetch overdue and high priority incomplete tasks. Use when user asks about urgent, important, or overdue tasks.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: 'get_all_tasks',
    description: 'Fetch all pending (incomplete) tasks with due dates. Use when user asks to see all their tasks or task list.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: 'get_pipeline_status',
    description: 'Get total pipeline value, deals per stage, and active deals count. Use when user asks about pipeline, deals overview, or sales status.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: 'get_analytics',
    description: 'Get deals by stage, recent interactions count, and conversion info. Use when user asks about analytics, performance, or stats.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: 'create_task',
    description: 'Create a new task. Use when user asks to add, create, or schedule a task.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Task title' },
        priority: { type: SchemaType.STRING, description: 'Priority level. Must be one of: high, normal, low' },
        due_date: { type: SchemaType.STRING, description: 'Due date in YYYY-MM-DD format (optional)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'get_contacts',
    description: 'Search contacts by name or return recent contacts. Use when user asks about contacts or people.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        search: { type: SchemaType.STRING, description: 'Search term to filter contacts by name (optional)' },
      },
    },
  },
  {
    name: 'get_recent_activity',
    description: 'Get last 10 interactions (calls, emails, meetings, notes). Use when user asks about recent activity or interactions.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: 'create_contact',
    description: 'Create a new contact in the CRM. Use when user says "add contact", "create contact", or similar.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        first_name: { type: SchemaType.STRING, description: 'Contact first name' },
        last_name: { type: SchemaType.STRING, description: 'Contact last name' },
        organization_name: { type: SchemaType.STRING, description: 'Name of the organization to link the contact to (optional)' },
        title: { type: SchemaType.STRING, description: 'Job title (optional)' },
        email: { type: SchemaType.STRING, description: 'Email address (optional)' },
      },
      required: ['first_name', 'last_name'],
    },
  },
  {
    name: 'create_deal',
    description: 'Create a new deal in the pipeline. Use when user says "create deal", "add deal", "new opportunity", or similar.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Deal title or name' },
        organization_name: { type: SchemaType.STRING, description: 'Organization this deal is for (optional)' },
        value: { type: SchemaType.NUMBER, description: 'Deal value in USD (optional)' },
        stage_name: { type: SchemaType.STRING, description: 'Pipeline stage name (optional, defaults to first stage)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as complete. Use when user says "complete task", "mark task done", "finish task", or similar.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        task_title: { type: SchemaType.STRING, description: 'Title or partial title of the task to mark complete' },
      },
      required: ['task_title'],
    },
  },
  {
    name: 'daily_briefing',
    description: "Get a daily briefing: overdue tasks, tasks due today, and deals closing soon. Use for \"daily briefing\", \"what's on today\", \"what do I have today\", \"morning summary\", or similar.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
]

export const WRITE_TOOLS = new Set(['create_contact', 'create_deal', 'complete_task'])

export function buildActionPreview(toolName: string, args: Record<string, unknown>): { title: string; details: string[] } {
  switch (toolName) {
    case 'create_contact': {
      const name = `${args.first_name ?? ''} ${args.last_name ?? ''}`.trim()
      const details: string[] = []
      if (args.organization_name) details.push(`Organization: ${args.organization_name}`)
      if (args.title) details.push(`Title: ${args.title}`)
      if (args.email) details.push(`Email: ${args.email}`)
      return { title: `Create contact: ${name}`, details }
    }
    case 'create_deal': {
      const details: string[] = []
      if (args.organization_name) details.push(`Organization: ${args.organization_name}`)
      if (args.value) details.push(`Value: $${Number(args.value).toLocaleString()}`)
      if (args.stage_name) details.push(`Stage: ${args.stage_name}`)
      return { title: `Create deal: ${args.title}`, details }
    }
    case 'complete_task':
      return { title: `Mark complete: ${args.task_title}`, details: [] }
    default:
      return { title: toolName, details: [] }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeTool(name: string, args: Record<string, unknown>, supabase: any): Promise<unknown> {
  const today = getLocalToday()

  switch (name) {
    case 'get_urgent_tasks': {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority, is_complete, contacts(id, first_name, last_name)')
        .is('deleted_at', null)
        .eq('is_complete', false)
        .order('due_date', { ascending: true })
        .limit(20)

      const tasks = (data ?? []).filter(
        (t: { due_date: string | null; priority: string | null }) =>
          (t.due_date && toDateOnly(t.due_date) < today) || t.priority === 'high'
      )
      return { tasks, today }
    }

    case 'get_all_tasks': {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority, is_complete, contacts(id, first_name, last_name)')
        .is('deleted_at', null)
        .eq('is_complete', false)
        .order('due_date', { ascending: true })
        .limit(30)

      return { tasks: data ?? [], today }
    }

    case 'get_pipeline_status': {
      const { data } = await supabase
        .from('deals')
        .select('id, title, value, pipeline_stages(name, is_won, is_lost)')
        .is('deleted_at', null)

      const deals = data ?? []
      const activeDeals = deals.filter((d: { pipeline_stages: { is_won: boolean; is_lost: boolean } | null }) => {
        const s = d.pipeline_stages
        return s && !s.is_won && !s.is_lost
      })
      const totalValue = activeDeals.reduce((sum: number, d: { value: number | null }) => sum + (d.value ?? 0), 0)

      const byStage: Record<string, { count: number; value: number }> = {}
      for (const deal of deals) {
        const stageName = (deal.pipeline_stages as { name: string } | null)?.name ?? 'Unknown'
        if (!byStage[stageName]) byStage[stageName] = { count: 0, value: 0 }
        byStage[stageName].count++
        byStage[stageName].value += deal.value ?? 0
      }

      return { totalActiveDeals: activeDeals.length, totalPipelineValue: totalValue, dealsByStage: byStage }
    }

    case 'get_analytics': {
      const [dealsResult, interactionsResult] = await Promise.all([
        supabase
          .from('deals')
          .select('id, value, pipeline_stages(name, is_won, is_lost)')
          .is('deleted_at', null),
        supabase
          .from('interactions')
          .select('id, type, occurred_at')
          .is('deleted_at', null)
          .order('occurred_at', { ascending: false })
          .limit(50),
      ])

      const deals = dealsResult.data ?? []
      const interactions = interactionsResult.data ?? []

      const wonDeals = deals.filter((d: { pipeline_stages: { is_won: boolean } | null }) => d.pipeline_stages?.is_won)
      const lostDeals = deals.filter((d: { pipeline_stages: { is_lost: boolean } | null }) => d.pipeline_stages?.is_lost)
      const closedDeals = wonDeals.length + lostDeals.length
      const conversionRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0

      const byType: Record<string, number> = {}
      for (const i of interactions) {
        byType[i.type] = (byType[i.type] || 0) + 1
      }

      return {
        totalDeals: deals.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        conversionRate: `${conversionRate}%`,
        recentInteractions: interactions.length,
        interactionsByType: byType,
      }
    }

    case 'create_task': {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const accountId = await getAccountId(supabase, user.id)
      const title = args.title as string
      const priority = (args.priority as string) || 'normal'
      const due_date = (args.due_date as string) || null

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          account_id: accountId,
          created_by: user.id,
          assignee_id: user.id,
          title,
          priority,
          due_date,
          is_complete: false,
        })
        .select('id, title, priority, due_date')
        .single()

      if (error) return { error: 'Failed to create task: ' + error.message }
      return { created: true, task: data }
    }

    case 'get_contacts': {
      const search = args.search as string | undefined
      let query = supabase
        .from('contacts')
        .select('id, first_name, last_name, email, phone, title, contact_organizations(organizations(name))')
        .is('deleted_at', null)
        .order('last_name')
        .limit(10)

      if (search) {
        query = query.textSearch('search_vector', search, { type: 'websearch' })
      }

      const { data } = await query
      const contacts = (data ?? []).map((c: Record<string, unknown>) => {
        const orgs = (c.contact_organizations as { organizations: { name: string } | null }[] | null) ?? []
        const orgName = orgs[0]?.organizations?.name ?? null
        return {
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
          phone: c.phone,
          title: c.title,
          organization: orgName,
        }
      })

      return { contacts }
    }

    case 'get_recent_activity': {
      const { data } = await supabase
        .from('interactions')
        .select('id, type, subject, occurred_at, contacts(first_name, last_name), deals(title)')
        .is('deleted_at', null)
        .order('occurred_at', { ascending: false })
        .limit(10)

      const activity = (data ?? []).map((i: Record<string, unknown>) => {
        const contact = i.contacts as { first_name: string; last_name: string } | null
        const deal = i.deals as { title: string } | null
        return {
          type: i.type,
          subject: i.subject,
          date: i.occurred_at,
          contact: contact ? `${contact.first_name} ${contact.last_name}` : null,
          deal: deal?.title ?? null,
        }
      })

      return { activity }
    }

    case 'create_contact': {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const accountId = await getAccountId(supabase, user.id)
      const first_name = args.first_name as string
      const last_name = args.last_name as string
      const title = (args.title as string | undefined) || null
      const email = (args.email as string | undefined) || null
      const organization_name = args.organization_name as string | undefined

      let orgId: string | null = null
      let orgName: string | null = null

      if (organization_name) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name')
          .ilike('name', organization_name)
          .is('deleted_at', null)
          .limit(1)
          .maybeSingle()

        if (!org) {
          return { error: `Organization "${organization_name}" not found. Please check the name and try again.` }
        }
        orgId = org.id
        orgName = org.name
      }

      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          account_id: accountId,
          created_by: user.id,
          updated_by: user.id,
          first_name,
          last_name,
          title,
          email,
        })
        .select('id, first_name, last_name')
        .single()

      if (contactError) return { error: 'Failed to create contact: ' + contactError.message }

      if (orgId) {
        await supabase
          .from('contact_organizations')
          .insert({ contact_id: contact.id, organization_id: orgId, is_primary: true })
      }

      return { created: true, contact: { id: contact.id, name: `${first_name} ${last_name}`, organization: orgName } }
    }

    case 'create_deal': {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const accountId = await getAccountId(supabase, user.id)
      const title = args.title as string
      const organization_name = args.organization_name as string | undefined
      const value = args.value as number | undefined
      const stage_name = args.stage_name as string | undefined

      let stageId: string
      let stageName: string

      if (stage_name) {
        const { data: stage } = await supabase
          .from('pipeline_stages')
          .select('id, name')
          .ilike('name', stage_name)
          .eq('account_id', accountId)
          .limit(1)
          .maybeSingle()

        if (!stage) {
          return { error: `Pipeline stage "${stage_name}" not found. Please check the name and try again.` }
        }
        stageId = stage.id
        stageName = stage.name
      } else {
        const { data: stage, error: stageError } = await supabase
          .from('pipeline_stages')
          .select('id, name')
          .eq('account_id', accountId)
          .eq('is_won', false)
          .eq('is_lost', false)
          .order('display_order', { ascending: true })
          .limit(1)
          .single()

        if (stageError || !stage) return { error: 'No active pipeline stages found.' }
        stageId = stage.id
        stageName = stage.name
      }

      let orgId: string | null = null
      let orgName: string | null = null

      if (organization_name) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name')
          .ilike('name', organization_name)
          .is('deleted_at', null)
          .limit(1)
          .maybeSingle()

        if (!org) {
          return { error: `Organization "${organization_name}" not found. Please check the name and try again.` }
        }
        orgId = org.id
        orgName = org.name
      }

      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          account_id: accountId,
          created_by: user.id,
          updated_by: user.id,
          owner_id: user.id,
          title,
          stage_id: stageId,
          value: value ?? null,
          organization_id: orgId,
        })
        .select('id, title, value, pipeline_stages(name)')
        .single()

      if (dealError) return { error: 'Failed to create deal: ' + dealError.message }

      return { created: true, deal: { id: deal.id, title: deal.title, value: deal.value, stage: stageName, organization: orgName } }
    }

    case 'complete_task': {
      const task_title = args.task_title as string

      const { data: matches } = await supabase
        .from('tasks')
        .select('id, title, due_date')
        .ilike('title', `%${task_title}%`)
        .eq('is_complete', false)
        .is('deleted_at', null)
        .limit(5)

      const tasks = matches ?? []

      if (tasks.length === 0) {
        return { error: `No incomplete task found matching "${task_title}".` }
      }

      if (tasks.length >= 2) {
        return {
          matches: tasks.map((t: { id: string; title: string }) => ({ id: t.id, title: t.title })),
          message: 'Multiple tasks found. Which did you mean?',
        }
      }

      const task = tasks[0]
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      await supabase
        .from('tasks')
        .update({ is_complete: true, completed_at: new Date().toISOString(), updated_by: user.id })
        .eq('id', task.id)

      return { completed: true, task: { id: task.id, title: task.title } }
    }

    case 'daily_briefing': {
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() + 7)
      const weekEndStr = weekEnd.toISOString().split('T')[0]

      const [overdueResult, todayResult, dealsResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title, due_date')
          .eq('is_complete', false)
          .lt('due_date', today)
          .is('deleted_at', null)
          .order('due_date', { ascending: true })
          .limit(20),
        supabase
          .from('tasks')
          .select('id, title, due_date')
          .eq('is_complete', false)
          .eq('due_date', today)
          .is('deleted_at', null)
          .order('due_date', { ascending: true })
          .limit(20),
        supabase
          .from('deals')
          .select('id, title, value, expected_close, pipeline_stages(name, is_won, is_lost)')
          .is('deleted_at', null)
          .gte('expected_close', today)
          .lte('expected_close', weekEndStr)
          .limit(20),
      ])

      const overdueTasks = overdueResult.data ?? []
      const dueTodayTasks = todayResult.data ?? []
      const allDeals = dealsResult.data ?? []

      const closingSoonDeals = allDeals.filter((d: { pipeline_stages: { is_won: boolean; is_lost: boolean } | null }) => {
        const s = d.pipeline_stages
        return s && !s.is_won && !s.is_lost
      })

      return {
        summary: {
          overdue_count: overdueTasks.length,
          due_today_count: dueTodayTasks.length,
          closing_soon_count: closingSoonDeals.length,
        },
        overdue_tasks: overdueTasks,
        due_today_tasks: dueTodayTasks,
        closing_soon_deals: closingSoonDeals,
      }
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}
