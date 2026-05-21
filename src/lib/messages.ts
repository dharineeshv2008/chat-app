import type { Message } from '../types'

export function normalizeMessage(raw: unknown): Message | null {
  if (!raw || typeof raw !== 'object') return null

  const row = raw as Record<string, unknown>
  const id = row.id != null ? String(row.id) : ''
  const text = row.text != null ? String(row.text) : ''
  const created_at =
    row.created_at != null
      ? String(row.created_at)
      : row.createdAt != null
        ? String(row.createdAt)
        : ''
  const sender = row.sender != null ? String(row.sender) : ''
  const deleted_for_everyone = Boolean(row.deleted_for_everyone)
  const deleted_at =
    row.deleted_at != null && row.deleted_at !== ''
      ? String(row.deleted_at)
      : null

  if (!id || !created_at) return null
  if (!deleted_for_everyone && !text) return null
  if (sender !== 'John' && sender !== 'Friend') return null

  return {
    id,
    sender: sender as Message['sender'],
    text,
    created_at,
    deleted_for_everyone,
    deleted_at,
  }
}

export function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const byId = new Map(existing.map((m) => [m.id, m]))
  for (const msg of incoming) {
    byId.set(msg.id, msg)
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

export function filterVisibleMessages(
  messages: Message[],
  hiddenIds: Set<string>,
  clearedAt: string | null,
): Message[] {
  const clearedTime = clearedAt ? new Date(clearedAt).getTime() : null

  return messages.filter((m) => {
    if (hiddenIds.has(m.id)) return false
    if (clearedTime != null && new Date(m.created_at).getTime() <= clearedTime) {
      return false
    }
    return true
  })
}
