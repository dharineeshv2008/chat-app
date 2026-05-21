import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './env'
import { debugLog } from './debug'

const { url, key, isConfigured } = getSupabaseConfig()

if (!isConfigured) {
  console.error(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'On Vercel: add env vars and redeploy (Vite embeds them at build time).',
  )
} else {
  debugLog('supabase', 'Configured', { url })
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
})

export const isSupabaseConfigured = isConfigured
