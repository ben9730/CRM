import { GoogleGenerativeAI, type FunctionResponsePart } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { chatTools, executeTool, SYSTEM_PROMPT } from '@/lib/chat/tools'
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
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
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
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: chatTools }],
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

    // Save messages to DB if sessionId provided
    if (sessionId) {
      await saveMessages(supabase, sessionId, message, text)
    }

    // Build the updated history to send back
    const updatedHistory = await chat.getHistory()

    return NextResponse.json({ response: text, history: updatedHistory })
  } catch (err) {
    console.error('Chat API error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    // Detect Gemini rate limit (RPM or RPD exceeded)
    const isRateLimited =
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED')

    if (isRateLimited) {
      return NextResponse.json(
        { rateLimited: true, friendlyMessage: "I'm taking a breather -- try again in a minute" },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: `AI error: ${errorMessage}` }, { status: 500 })
  }
}
