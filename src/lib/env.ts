export function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
  return { url, key, isConfigured: Boolean(url && key) }
}

export function assertSupabaseConfigured(): string | null {
  const { isConfigured } = getSupabaseConfig()
  if (isConfigured) return null
  return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.'
}
