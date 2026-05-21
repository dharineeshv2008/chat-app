import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { REALTIME_CHANNEL } from '../lib/constants'
import type { TypingPayload, UserName } from '../types'

const TYPING_EVENT = 'typing'
const TYPING_TIMEOUT_MS = 2000
const TYPING_CHANNEL = `${REALTIME_CHANNEL}-typing`

export function useTyping(currentUser: UserName, otherUser: UserName) {
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const subscribedRef = useRef(false)

  useEffect(() => {
    subscribedRef.current = false

    const channel = supabase.channel(TYPING_CHANNEL, {
      config: { broadcast: { self: false } },
    })
    channelRef.current = channel

    channel
      .on('broadcast', { event: TYPING_EVENT }, ({ payload }) => {
        const data = payload as TypingPayload
        if (!data || data.user !== otherUser) return

        setIsOtherTyping(Boolean(data.isTyping))

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), TYPING_TIMEOUT_MS)
        }
      })
      .subscribe((status) => {
        subscribedRef.current = status === 'SUBSCRIBED'
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          subscribedRef.current = false
        }
      })

    return () => {
      subscribedRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current)
      void supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [otherUser])

  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      if (!subscribedRef.current || !channelRef.current) return
      void channelRef.current.send({
        type: 'broadcast',
        event: TYPING_EVENT,
        payload: { user: currentUser, isTyping } satisfies TypingPayload,
      })
    },
    [currentUser],
  )

  const notifyTyping = useCallback(() => {
    broadcastTyping(true)
    if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current)
    broadcastTimeoutRef.current = setTimeout(() => broadcastTyping(false), TYPING_TIMEOUT_MS)
  }, [broadcastTyping])

  const stopTyping = useCallback(() => {
    if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current)
    broadcastTyping(false)
  }, [broadcastTyping])

  return { isOtherTyping, notifyTyping, stopTyping }
}
