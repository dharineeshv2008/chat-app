import { useCallback, useMemo, useState } from 'react'
import {
  getHiddenMessageIds,
  hideMessageForUser,
} from '../lib/hiddenMessages'
import type { UserName } from '../types'

export function useHiddenMessages(currentUser: UserName) {
  const [version, setVersion] = useState(0)

  const hiddenIds = useMemo(() => {
    void version
    return getHiddenMessageIds(currentUser)
  }, [currentUser, version])

  const hideForMe = useCallback(
    (messageId: string) => {
      hideMessageForUser(currentUser, messageId)
      setVersion((v) => v + 1)
    },
    [currentUser],
  )

  return { hiddenIds, hideForMe }
}
