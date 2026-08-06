import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(
  url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('YOUR-PROJECT') &&
    !key.includes('YOUR-ANON')
)

export const supabase = isConfigured ? createClient(url, key) : null

/**
 * Fetch every row of a query, paging past Supabase's 1000-row limit.
 * `build` receives (from, to) and must return a supabase query promise.
 */
export async function fetchAllPages(build, pageSize = 1000) {
  const all = []
  let from = 0
  for (;;) {
    const { data, error } = await build(from, from + pageSize - 1)
    if (error) throw error
    all.push(...data)
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return all
}
