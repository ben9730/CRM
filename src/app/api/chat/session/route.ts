import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get most recent session for this user
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
  const sessionIsStale =
    !session ||
    Date.now() - new Date(session.updated_at).getTime() > TWENTY_FOUR_HOURS

  let sessionId: string

  if (sessionIsStale) {
    // Create a new session
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id })
      .select('id')
      .single()
    sessionId = newSession!.id
    return NextResponse.json({ sessionId, messages: [] })
  }

  sessionId = session.id

  // Fetch messages for this session ordered by created_at ASC
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    sessionId,
    messages: (messages ?? []).map(m => ({ role: m.role, content: m.content })),
  })
}
