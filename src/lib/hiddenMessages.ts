import { HIDDEN_MESSAGES_KEY } from './constants'
import type { UserName } from '../types'

type HiddenStore = Partial<Record<UserName, string[]>>

function readStore(): HiddenStore {
  try {
    const raw = localStorage.getItem(HIDDEN_MESSAGES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as HiddenStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store: HiddenStore): void {
  localStorage.setItem(HIDDEN_MESSAGES_KEY, JSON.stringify(store))
}

export function getHiddenMessageIds(user: UserName): Set<string> {
  const store = readStore()
  const ids = store[user] ?? []
  return new Set(ids.filter((id) => typeof id === 'string'))
}

export function hideMessageForUser(user: UserName, messageId: string): void {
  const store = readStore()
  const existing = new Set(store[user] ?? [])
  existing.add(messageId)
  store[user] = [...existing]
  writeStore(store)
}

export function clearHiddenForUser(user: UserName): void {
  const store = readStore()
  delete store[user]
  writeStore(store)
}
