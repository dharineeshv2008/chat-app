import { SESSION_KEYS } from './constants'
import type { UserName } from '../types'

export function isAccessGranted(): boolean {
  return sessionStorage.getItem(SESSION_KEYS.access) === 'granted'
}

export function grantAccess(): void {
  sessionStorage.setItem(SESSION_KEYS.access, 'granted')
}

export function revokeAccess(): void {
  sessionStorage.removeItem(SESSION_KEYS.access)
  sessionStorage.removeItem(SESSION_KEYS.user)
}

export function getCurrentUser(): UserName | null {
  const user = sessionStorage.getItem(SESSION_KEYS.user)
  if (user === 'John' || user === 'Friend') return user
  return null
}

export function setCurrentUser(user: UserName): void {
  sessionStorage.setItem(SESSION_KEYS.user, user)
}

export function clearCurrentUser(): void {
  sessionStorage.removeItem(SESSION_KEYS.user)
}
