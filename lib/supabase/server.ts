import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Server-only client. Single fixed user, no Supabase Auth (see implementation
// stack notes) — RLS is enabled on the project with permissive policies for
// now, and the anon key is used from server code only (never exposed to the
// client bundle). Every query is additionally scoped to APP_USER_ID in
// application code as a second guard.
//
// Untyped on purpose: hand-rolling a Database generic that satisfies
// supabase-js's PostgrestQueryBuilder inference is more trouble than it's
// worth for a single-user app. Row shapes are defined once in ./types and
// enforced at the DTO boundary in app/actions.ts instead.
let client: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY). Copy .env.local.example to .env.local and fill in your Supabase project values.',
    )
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  })
  return client
}
