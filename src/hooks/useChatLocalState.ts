import { useCallback, useMemo, useState } from 'react'
import {
  clearChatForUser,
  getClearedAt,
  getHiddenMessageIds,
  hideMessageForUser,
  hideMessagesForUser,
} from '../lib/chatLocalState'
import type { UserName } from '../types'

export function useChatLocalState(currentUser: UserName) {
  const [version, setVersion] = useState(0)

  const hiddenIds = useMemo(() => {
    void version
    return getHiddenMessageIds(currentUser)
  }, [currentUser, version])

  const clearedAt = useMemo(() => {
    void version
    return getClearedAt(currentUser)
  }, [currentUser, version])

  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const hideForMe = useCallback(
    (messageId: string) => {
      hideMessageForUser(currentUser, messageId)
      bump()
    },
    [currentUser, bump],
  )

  const hideManyForMe = useCallback(
    (messageIds: string[]) => {
      if (messageIds.length === 0) return
      hideMessagesForUser(currentUser, messageIds)
      bump()
    },
    [currentUser, bump],
  )

  const clearChatForMe = useCallback(() => {
    clearChatForUser(currentUser, new Date().toISOString())
    bump()
  }, [currentUser, bump])

  return {
    hiddenIds,
    clearedAt,
    hideForMe,
    hideManyForMe,
    clearChatForMe,
  }
}
