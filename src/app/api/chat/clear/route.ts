import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const sessionId = body?.sessionId
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

    // Verify ownership via RLS (SELECT filtered by user_id)
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    // Delete messages then session (RLS enforced)
    await supabase.from('chat_messages').delete().eq('session_id', sessionId)
    await supabase.from('chat_sessions').delete().eq('id', sessionId)

    // Create a fresh session
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id })
      .select('id')
      .single()

    return NextResponse.json({ sessionId: newSession!.id })
  } catch (error) {
    console.error('[chat/clear] Error:', error)
    return NextResponse.json({ error: 'Failed to clear chat' }, { status: 500 })
  }
}
