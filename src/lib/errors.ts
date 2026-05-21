const MIGRATION_HINT =
  'Run supabase/fix_deletion_columns.sql in your Supabase SQL Editor, wait a few seconds, then refresh this page.'

export function formatSupabaseError(message: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes('schema cache') ||
    lower.includes('deleted_at') ||
    lower.includes('deleted_for_everyone')
  ) {
    return `Database migration required. ${MIGRATION_HINT}`
  }
  return message
}
