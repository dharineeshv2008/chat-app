import { DELETE_FOR_EVERYONE_MS } from './constants'
import type { Message, UserName } from '../types'

export function getDeleteEveryoneRemainingMs(message: Message, now = Date.now()): number {
  const sentAt = new Date(message.created_at).getTime()
  const elapsed = now - sentAt
  return Math.max(0, DELETE_FOR_EVERYONE_MS - elapsed)
}

export function canDeleteForEveryone(
  message: Message,
  currentUser: UserName,
  now = Date.now(),
): boolean {
  if (message.sender !== currentUser) return false
  if (message.deleted_for_everyone) return false
  return getDeleteEveryoneRemainingMs(message, now) > 0
}

export function getDeleteEveryoneSecondsLeft(message: Message, now = Date.now()): number {
  return Math.ceil(getDeleteEveryoneRemainingMs(message, now) / 1000)
}
