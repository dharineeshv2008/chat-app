import { CHAT_LOCAL_STATE_KEY, HIDDEN_MESSAGES_KEY } from './constants'
import type { UserName } from '../types'

type UserLocalState = {
  hiddenIds: string[]
  clearedAt: string | null
}

type LocalStore = Partial<Record<UserName, UserLocalState>>

function emptyUserState(): UserLocalState {
  return { hiddenIds: [], clearedAt: null }
}

function readStore(): LocalStore {
  try {
    const raw =
      localStorage.getItem(CHAT_LOCAL_STATE_KEY) ??
      localStorage.getItem(HIDDEN_MESSAGES_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as LocalStore | Record<UserName, string[]>

    if (!parsed || typeof parsed !== 'object') return {}

    const store: LocalStore = {}
    for (const key of ['John', 'Friend'] as UserName[]) {
      const value = (parsed as LocalStore)[key]
      if (Array.isArray(value)) {
        store[key] = { hiddenIds: value.filter((id) => typeof id === 'string'), clearedAt: null }
      } else if (value && typeof value === 'object') {
        store[key] = {
          hiddenIds: Array.isArray(value.hiddenIds) ? value.hiddenIds : [],
          clearedAt: typeof value.clearedAt === 'string' ? value.clearedAt : null,
        }
      }
    }
    return store
  } catch {
    return {}
  }
}

function writeStore(store: LocalStore): void {
  localStorage.setItem(CHAT_LOCAL_STATE_KEY, JSON.stringify(store))
  localStorage.removeItem(HIDDEN_MESSAGES_KEY)
}

function getUserState(user: UserName): UserLocalState {
  return readStore()[user] ?? emptyUserState()
}

export function getHiddenMessageIds(user: UserName): Set<string> {
  return new Set(getUserState(user).hiddenIds)
}

export function getClearedAt(user: UserName): string | null {
  return getUserState(user).clearedAt
}

export function hideMessageForUser(user: UserName, messageId: string): void {
  const store = readStore()
  const state = store[user] ?? emptyUserState()
  const ids = new Set(state.hiddenIds)
  ids.add(messageId)
  store[user] = { ...state, hiddenIds: [...ids] }
  writeStore(store)
}

export function hideMessagesForUser(user: UserName, messageIds: string[]): void {
  const store = readStore()
  const state = store[user] ?? emptyUserState()
  const ids = new Set(state.hiddenIds)
  for (const id of messageIds) ids.add(id)
  store[user] = { ...state, hiddenIds: [...ids] }
  writeStore(store)
}

export function clearChatForUser(user: UserName, clearedAt: string): void {
  const store = readStore()
  const state = store[user] ?? emptyUserState()
  store[user] = { ...state, clearedAt }
  writeStore(store)
}

export function clearHiddenForUser(user: UserName): void {
  const store = readStore()
  delete store[user]
  writeStore(store)
}
