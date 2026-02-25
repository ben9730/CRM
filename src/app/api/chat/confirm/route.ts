import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { chatTools, executeTool, SYSTEM_PROMPT } from '@/lib/chat/tools'

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { tool, args, sessionId, history } = await request.json()
    if (!tool || !args) return NextResponse.json({ error: 'Missing tool or args' }, { status: 400 })

    // Execute the confirmed write tool
    const toolResult = await executeTool(tool, args as Record<string, unknown>, supabase)

    // Find the tool call ID from history (last assistant message with tool_calls)
    const lastAssistant = [...(history ?? [])].reverse().find(
      (m: { role: string; tool_calls?: unknown[] }) => m.role === 'assistant' && m.tool_calls
    )
    const toolCallId = lastAssistant?.tool_calls?.find(
      (tc: { function: { name: string } }) => tc.function.name === tool
    )?.id ?? 'call_confirmed'

    // Send tool result to Groq to get a natural language confirmation
    const groq = new Groq({ apiKey })

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history ?? []),
      {
        role: 'tool',
        tool_call_id: toolCallId,
        content: JSON.stringify(toolResult),
      },
    ]

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: chatTools,
      tool_choice: 'none',
    })

    const text = response.choices[0].message.content ?? ''

    // Save assistant confirmation message to DB
    if (sessionId) {
      await supabase.from('chat_messages').insert([
        { session_id: sessionId, role: 'assistant', content: text },
      ])
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)
    }

    const updatedHistory = [
      ...(history ?? []),
      {
        role: 'tool' as const,
        tool_call_id: toolCallId,
        content: JSON.stringify(toolResult),
      },
      response.choices[0].message,
    ]

    return NextResponse.json({ response: text, history: updatedHistory })
  } catch (err) {
    console.error('Confirm API error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    const isRateLimited = errorMessage.includes('429') || errorMessage.includes('rate_limit')
    if (isRateLimited) {
      return NextResponse.json(
        { rateLimited: true, friendlyMessage: "I'm taking a breather -- try again in a minute" },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: `AI error: ${errorMessage}` }, { status: 500 })
  }
}
