import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { REALTIME_CHANNEL } from '../lib/constants'
import type { UserName } from '../types'

const PRESENCE_CHANNEL = `${REALTIME_CHANNEL}-presence`

export function usePresence(currentUser: UserName) {
  const [onlineUsers, setOnlineUsers] = useState<Set<UserName>>(new Set())

  useEffect(() => {
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: currentUser } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{ user: UserName }>()
      const users = new Set<UserName>()

      for (const presences of Object.values(state)) {
        for (const presence of presences) {
          if (presence.user === 'John' || presence.user === 'Friend') {
            users.add(presence.user)
          }
        }
      }

      setOnlineUsers(users)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user: currentUser,
          online_at: new Date().toISOString(),
        })
      }
    })

    return () => {
      void channel.untrack()
      void supabase.removeChannel(channel)
    }
  }, [currentUser])

  const isOtherOnline = (other: UserName) => onlineUsers.has(other)

  return { onlineUsers, isOtherOnline }
}
