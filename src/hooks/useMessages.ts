import { useCallback, useEffect, useRef, useState } from 'react'
import { assertSupabaseConfigured } from '../lib/env'
import { debugLog } from '../lib/debug'
import { formatSupabaseError } from '../lib/errors'
import { canDeleteForEveryone } from '../lib/deleteUtils'
import { mergeMessages, normalizeMessage } from '../lib/messages'
import { supabase } from '../lib/supabase'
import type { Message, UserName } from '../types'

const REALTIME_CHANNEL = 'messages'
const FALLBACK_POLL_MS = 4_000

export type RealtimeConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'

export function useMessages(currentUser: UserName) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeConnectionStatus>('connecting')

  const messagesRef = useRef<Message[]>([])
  messagesRef.current = messages

  const clearError = useCallback(() => setError(null), [])

  const appendMessage = useCallback((raw: unknown) => {
    const msg = normalizeMessage(raw)
    if (!msg) {
      debugLog('messages', 'Skip invalid payload', raw)
      return
    }

    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) {
        return mergeMessages(prev, [msg])
      }
      const next = [...prev, msg].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      debugLog('messages', 'Appended', msg.id, 'total', next.length)
      return next
    })
  }, [])

  const fetchMessages = useCallback(async () => {
    const configError = assertSupabaseConfigured()
    if (configError) {
      setError(configError)
      return false
    }

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

    setMessages((prev) => mergeMessages(prev, normalized))
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

      if (data) appendMessage(data)
      clearError()
      return true
    },
    [currentUser, appendMessage, clearError],
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

      if (data) appendMessage(data)
      clearError()
      return true
    },
    [currentUser, appendMessage, clearError],
  )

  useEffect(() => {
    let cancelled = false
    const configError = assertSupabaseConfigured()
    if (configError) {
      setError(configError)
      setLoading(false)
      setConnectionStatus('error')
      return
    }

    async function loadInitial() {
      setLoading(true)
      try {
        await fetchMessages()
        if (!cancelled) clearError()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadInitial()

    const channel = supabase
      .channel(REALTIME_CHANNEL)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (cancelled) return
          debugLog('messages', 'Realtime INSERT', payload.new)
          appendMessage(payload.new)
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (cancelled) return
          debugLog('messages', 'Realtime UPDATE', payload.new)
          appendMessage(payload.new)
        },
      )
      .subscribe((status, err) => {
        debugLog('messages', 'Realtime status', status, err)
        if (cancelled) return

        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected')
          clearError()
        } else if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT' ||
          status === 'CLOSED'
        ) {
          setConnectionStatus('disconnected')
          setError((prev) =>
            prev ??
              'Live updates disconnected. Check Supabase Realtime is enabled for the messages table.',
          )
        } else if (status === 'SUBSCRIBING') {
          setConnectionStatus('connecting')
        }
      })

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        void fetchMessages()
      }
    }

    const onOnline = () => {
      if (!cancelled) void fetchMessages()
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      void supabase.removeChannel(channel)
    }
  }, [currentUser, appendMessage, fetchMessages, clearError])

  useEffect(() => {
    if (connectionStatus === 'connected') return

    const pollId = window.setInterval(() => {
      debugLog('messages', 'Fallback sync (realtime not connected)')
      void fetchMessages()
    }, FALLBACK_POLL_MS)

    return () => clearInterval(pollId)
  }, [connectionStatus, fetchMessages])

  return {
    messages,
    loading,
    error,
    connectionStatus,
    sendMessage,
    deleteForEveryone,
    clearError,
    refetch: fetchMessages,
  }
}
