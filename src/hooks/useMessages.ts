import { useCallback, useEffect, useRef, useState } from 'react'
import { debugLog } from '../lib/debug'
import { formatSupabaseError } from '../lib/errors'
import { canDeleteForEveryone } from '../lib/deleteUtils'
import { mergeMessages, normalizeMessage } from '../lib/messages'
import {
  reconnectMessagesChannel,
  subscribeToMessages,
  type RealtimeConnectionStatus,
} from '../lib/realtime/messagesChannel'
import { supabase } from '../lib/supabase'
import type { Message, UserName } from '../types'

/** Fallback poll only when WebSocket realtime is down (not for normal operation). */
const FALLBACK_POLL_MS = 12_000

export function useMessages(currentUser: UserName) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeConnectionStatus>('connecting')

  const messagesRef = useRef<Message[]>([])
  const initialLoadDone = useRef(false)

  messagesRef.current = messages

  const clearError = useCallback(() => setError(null), [])

  const upsertMessage = useCallback((raw: unknown) => {
    const msg = normalizeMessage(raw)
    if (!msg) {
      debugLog('messages', 'Ignored invalid payload', raw)
      return
    }

    setMessages((prev) => mergeMessages(prev, [msg]))
    debugLog('messages', 'Live upsert', msg.id)
  }, [])

  const fetchMessages = useCallback(async (isInitial = false) => {
    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(formatSupabaseError(fetchError.message))
      return false
    }

    const normalized = (data ?? [])
      .map(normalizeMessage)
      .filter((m): m is Message => m !== null)

    setMessages((prev) => {
      if (isInitial && !initialLoadDone.current) {
        initialLoadDone.current = true
        return normalized
      }
      return mergeMessages(prev, normalized)
    })

    return true
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return false

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({ sender: currentUser, text: trimmed })
        .select('*')
        .single()

      if (insertError) {
        setError(formatSupabaseError(insertError.message))
        return false
      }

      if (data) upsertMessage(data)
      clearError()
      return true
    },
    [currentUser, upsertMessage, clearError],
  )

  const deleteForEveryone = useCallback(
    async (messageId: string) => {
      const message = messagesRef.current.find((m) => m.id === messageId)
      if (!message) return false

      if (!canDeleteForEveryone(message, currentUser)) {
        setError('Delete for everyone is no longer available for this message.')
        return false
      }

      const { data, error: updateError } = await supabase
        .from('messages')
        .update({
          deleted_for_everyone: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender', currentUser)
        .eq('deleted_for_everyone', false)
        .select('*')
        .single()

      if (updateError) {
        setError(formatSupabaseError(updateError.message))
        return false
      }

      if (data) upsertMessage(data)
      clearError()
      return true
    },
    [currentUser, upsertMessage, clearError],
  )

  useEffect(() => {
    let cancelled = false
    initialLoadDone.current = false

    async function loadInitial() {
      setLoading(true)
      try {
        const ok = await fetchMessages(true)
        if (!cancelled && ok) clearError()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadInitial()

    const unsubscribe = subscribeToMessages(
      (row) => {
        if (!cancelled) upsertMessage(row)
      },
      (status) => {
        if (!cancelled) setConnectionStatus(status)
      },
    )

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        void reconnectMessagesChannel()
        void fetchMessages(false)
      }
    }

    const onOnline = () => {
      if (!cancelled) {
        void reconnectMessagesChannel()
        void fetchMessages(false)
      }
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)

    return () => {
      cancelled = true
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
    }
  }, [currentUser, upsertMessage, fetchMessages, clearError])

  useEffect(() => {
    if (connectionStatus === 'connected') return

    const id = window.setInterval(() => {
      debugLog('messages', 'Fallback poll (realtime disconnected)')
      void fetchMessages(false)
    }, FALLBACK_POLL_MS)

    return () => clearInterval(id)
  }, [connectionStatus, fetchMessages])

  return {
    messages,
    loading,
    error,
    connectionStatus,
    sendMessage,
    deleteForEveryone,
    clearError,
    refetch: () => fetchMessages(false),
  }
}
