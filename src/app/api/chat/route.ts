import { GoogleGenerativeAI, type FunctionDeclaration, type FunctionResponsePart, SchemaType } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getAccountId } from '@/lib/queries/account'
import { getLocalToday, toDateOnly } from '@/lib/utils'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an AI assistant built into a B2B Health CRM. You help sales reps manage their pipeline, tasks, and contacts.
- Always respond in the same language the user writes in (Hebrew or English)
- Be concise and actionable
- When showing tasks, always mention priority and due date
- When showing deals, always mention value and stage
- Format responses cleanly with emojis for readability
- When creating a task, confirm what was created
- If a query returns no results, let the user know politely`

const tools: FunctionDeclaration[] = [
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
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeTool(name: string, args: Record<string, unknown>, supabase: any): Promise<unknown> {
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

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { message, history } = await request.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: tools }],
    })

    const chat = model.startChat({
      history: history ?? [],
    })

    let result = await chat.sendMessage(message)
    let response = result.response

    // Handle tool calls in a loop (Gemini may call multiple tools sequentially)
    while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall)) {
      const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall)

      const toolResults: FunctionResponsePart[] = []
      for (const part of functionCalls) {
        const fc = part.functionCall!
        const toolResult = await executeTool(fc.name, (fc.args ?? {}) as Record<string, unknown>, supabase)
        toolResults.push({
          functionResponse: {
            name: fc.name,
            response: toolResult as object,
          },
        })
      }

      result = await chat.sendMessage(toolResults)
      response = result.response
    }

    const text = response.text()

    // Build the updated history to send back
    const updatedHistory = await chat.getHistory()

    return NextResponse.json({ response: text, history: updatedHistory })
  } catch (err) {
    console.error('Chat API error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `AI error: ${errorMessage}` }, { status: 500 })
  }
}
