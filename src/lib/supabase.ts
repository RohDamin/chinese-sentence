import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

function isValidHttpUrl(s: string): boolean {
  if (!s) return false
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export const supabaseConfigured = isValidHttpUrl(url) && Boolean(key)

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error('Supabase is not configured')
  }
  if (!client) {
    client = createClient(url, key)
  }
  return client
}

export async function getStatuses(categoryId: string) {
  if (!supabaseConfigured) {
    return []
  }
  const { data, error } = await getClient()
    .from('sentence_status')
    .select('sentence_id, is_checked, is_starred')
    .eq('category_id', categoryId)

  if (error) {
    console.error(error)
    return []
  }
  return data ?? []
}

export async function upsertStatus(
  categoryId: string,
  sentenceId: string,
  hanzi: string,
  updates: { is_checked?: boolean; is_starred?: boolean },
  existing?: { is_checked: boolean; is_starred: boolean },
) {
  if (!supabaseConfigured) {
    return
  }
  const is_checked = updates.is_checked ?? existing?.is_checked ?? false
  const is_starred = updates.is_starred ?? existing?.is_starred ?? false

  const { error } = await getClient().from('sentence_status').upsert(
    {
      category_id: categoryId,
      sentence_id: sentenceId,
      hanzi,
      is_checked,
      is_starred,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'category_id,sentence_id' },
  )

  if (error) {
    console.error(error)
  }
}
