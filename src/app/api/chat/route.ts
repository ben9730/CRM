import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { chatTools, executeTool, SYSTEM_PROMPT, WRITE_TOOLS, buildActionPreview } from '@/lib/chat/tools'
import type { SupabaseClient } from '@supabase/supabase-js'

export const maxDuration = 30

async function saveMessages(
  supabase: SupabaseClient,
  sessionId: string,
  userMessage: string,
  assistantMessage: string
) {
  await supabase.from('chat_messages').insert([
    { session_id: sessionId, role: 'user', content: userMessage },
    { session_id: sessionId, role: 'assistant', content: assistantMessage },
  ])
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { message, history, sessionId } = await request.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  try {
    const groq = new Groq({ apiKey })

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history ?? []),
      { role: 'user', content: message },
    ]

    let response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: chatTools,
      tool_choice: 'auto',
    })

    let assistantMessage = response.choices[0].message

    // Handle tool calls in a loop
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Check for write tools — return pendingAction instead of executing
      const writeCall = assistantMessage.tool_calls.find(tc => WRITE_TOOLS.has(tc.function.name))
      if (writeCall) {
        const args = (JSON.parse(writeCall.function.arguments) ?? {}) as Record<string, unknown>
        const preview = buildActionPreview(writeCall.function.name, args)

        // Save the user message before returning pendingAction
        if (sessionId) {
          await supabase.from('chat_messages').insert([
            { session_id: sessionId, role: 'user', content: message },
          ])
          await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId)
        }

        // Build history up to and including the tool call
        const updatedHistory = [
          ...(history ?? []),
          { role: 'user' as const, content: message },
          assistantMessage,
        ]

        return NextResponse.json({
          pendingAction: {
            tool: writeCall.function.name,
            args,
            preview,
            sessionId,
          },
          history: updatedHistory,
        })
      }

      // Execute non-write tools normally
      messages.push(assistantMessage)
      for (const toolCall of assistantMessage.tool_calls) {
        const toolResult = await executeTool(
          toolCall.function.name,
          (JSON.parse(toolCall.function.arguments) ?? {}) as Record<string, unknown>,
          supabase
        )
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        })
      }

      response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools: chatTools,
        tool_choice: 'auto',
      })
      assistantMessage = response.choices[0].message
    }

    const text = assistantMessage.content ?? ''

    // Save messages to DB if sessionId provided
    if (sessionId) {
      await saveMessages(supabase, sessionId, message, text)
    }

    // Build the updated history to send back (without system prompt)
    const updatedHistory = [
      ...(history ?? []),
      { role: 'user' as const, content: message },
      assistantMessage,
    ]

    return NextResponse.json({ response: text, history: updatedHistory })
  } catch (err) {
    console.error('Chat API error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    const isRateLimited =
      errorMessage.includes('429') ||
      errorMessage.includes('rate_limit')

    if (isRateLimited) {
      return NextResponse.json(
        { rateLimited: true, friendlyMessage: "I'm taking a breather -- try again in a minute" },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: `AI error: ${errorMessage}` }, { status: 500 })
  }
}
