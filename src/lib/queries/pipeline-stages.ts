import { createClient } from '@/lib/supabase/server'
import type { PipelineStageRow } from '@/lib/types/app'

/**
 * Returns all pipeline stages ordered by display_order.
 * No soft-delete filter needed — pipeline_stages has no deleted_at column.
 */
export async function getPipelineStages(): Promise<PipelineStageRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('display_order')

  if (error) {
    console.error('getPipelineStages error:', error)
    return []
  }

  return data ?? []
}
