-- Migration: add_chat_messages_delete_policy
-- Phase 07-02: Allow users to delete their own chat messages
-- Required for /api/chat/clear route (uses anon key + user cookies, RLS enforced)

CREATE POLICY "Users delete own messages"
  ON public.chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );

-- Note: chat_sessions already has FOR ALL policy "Users manage own sessions"
-- which covers DELETE on sessions. No additional policy needed.
