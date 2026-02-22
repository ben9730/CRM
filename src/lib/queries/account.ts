import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Retrieves the account_id for a given user from account_members.
 * Called by every Server Action that inserts records.
 */
export async function getAccountId(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw new Error(`No account found for user ${userId}. Ensure account_members row exists.`)
  }

  return data.account_id
}
