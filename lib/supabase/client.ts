import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return { url, key }
}

export function createClient() {
  const { url, key } = getSupabaseEnv()

  // Fallback to a placeholder client if credentials are not configured yet,
  // preventing "Your project's URL and Key are required to create a Supabase client" crash.
  const resolvedUrl = url || 'https://placeholder.supabase.co'
  const resolvedKey = key || 'placeholder-anon-key'

  client ??= createBrowserClient<Database>(resolvedUrl, resolvedKey)
  return client
}
