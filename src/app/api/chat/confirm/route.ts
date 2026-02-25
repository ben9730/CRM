import { GoogleGenerativeAI, type FunctionResponsePart } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { chatTools, executeTool, SYSTEM_PROMPT } from '@/lib/chat/tools'

export const maxDuration = 30

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { tool, args, sessionId, history } = await request.json()
  if (!tool || !args) return NextResponse.json({ error: 'Missing tool or args' }, { status: 400 })

  try {
    // Execute the confirmed write tool
    const toolResult = await executeTool(tool, args as Record<string, unknown>, supabase)

    // Send tool result to Gemini to get a natural language confirmation
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: chatTools }],
    })

    const chat = model.startChat({ history: history ?? [] })

    // Send function response to Gemini
    const functionResponse: FunctionResponsePart = {
      functionResponse: { name: tool, response: toolResult as object },
    }
    const result = await chat.sendMessage([functionResponse])
    const text = result.response.text()

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

    const updatedHistory = await chat.getHistory()
    return NextResponse.json({ response: text, history: updatedHistory })
  } catch (err) {
    console.error('Confirm API error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    const isRateLimited = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')
    if (isRateLimited) {
      return NextResponse.json(
        { rateLimited: true, friendlyMessage: "I'm taking a breather -- try again in a minute" },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: `AI error: ${errorMessage}` }, { status: 500 })
  }
}
