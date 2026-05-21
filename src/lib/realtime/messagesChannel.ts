import type { RealtimeChannel } from '@supabase/supabase-js'
import { debugLog } from '../debug'
import { supabase } from '../supabase'

export type RealtimeConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'

type MessageHandler = (row: unknown) => void
type StatusHandler = (status: RealtimeConnectionStatus) => void

const CHANNEL_NAME = 'messages-live'
const MAX_RECONNECT_ATTEMPTS = 8

let channel: RealtimeChannel | null = null
let subscriberCount = 0
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let teardownTimer: ReturnType<typeof setTimeout> | null = null
let currentStatus: RealtimeConnectionStatus = 'disconnected'

const TEARDOWN_DELAY_MS = 150

const messageHandlers = new Set<MessageHandler>()
const statusHandlers = new Set<StatusHandler>()

function setStatus(status: RealtimeConnectionStatus) {
  currentStatus = status
  statusHandlers.forEach((fn) => fn(status))
  debugLog('realtime', 'Connection status:', status)
}

function dispatchMessage(row: unknown) {
  messageHandlers.forEach((fn) => {
    try {
      fn(row)
    } catch (err) {
      console.error('[realtime] Handler error', err)
    }
  })
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function scheduleReconnect() {
  if (subscriberCount === 0) return
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    setStatus('error')
    return
  }

  clearReconnectTimer()
  const delay = Math.min(1000 * 2 ** reconnectAttempts, 15000)
  reconnectAttempts += 1
  debugLog('realtime', `Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`)

  reconnectTimer = setTimeout(() => {
    void createAndSubscribe()
  }, delay)
}

async function teardownChannel() {
  if (!channel) return
  const ch = channel
  channel = null
  try {
    await supabase.removeChannel(ch)
  } catch (err) {
    debugLog('realtime', 'removeChannel', err)
  }
}

async function createAndSubscribe() {
  if (subscriberCount === 0) return

  if (channel) await teardownChannel()

  setStatus('connecting')

  channel = supabase
    .channel(CHANNEL_NAME)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        debugLog('realtime', 'INSERT', payload.new)
        dispatchMessage(payload.new)
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages' },
      (payload) => {
        debugLog('realtime', 'UPDATE', payload.new)
        dispatchMessage(payload.new)
      },
    )
    .subscribe((status, err) => {
      debugLog('realtime', 'Channel status', status, err)

      if (status === 'SUBSCRIBED') {
        reconnectAttempts = 0
        setStatus('connected')
        return
      }

      if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setStatus('disconnected')
        scheduleReconnect()
      }
    })
}

export function getRealtimeStatus(): RealtimeConnectionStatus {
  return currentStatus
}

/** Subscribe to live message INSERT/UPDATE. Returns unsubscribe function. */
export function subscribeToMessages(
  onMessage: MessageHandler,
  onStatus?: StatusHandler,
): () => void {
  subscriberCount += 1
  messageHandlers.add(onMessage)
  if (onStatus) {
    statusHandlers.add(onStatus)
    onStatus(currentStatus)
  }

  if (subscriberCount === 1) {
    void createAndSubscribe()
  }

  return () => {
    messageHandlers.delete(onMessage)
    if (onStatus) statusHandlers.delete(onStatus)
    subscriberCount = Math.max(0, subscriberCount - 1)

    if (teardownTimer) clearTimeout(teardownTimer)

    if (subscriberCount === 0) {
      teardownTimer = setTimeout(() => {
        teardownTimer = null
        if (subscriberCount > 0) return
        clearReconnectTimer()
        reconnectAttempts = 0
        setStatus('disconnected')
        void teardownChannel()
      }, TEARDOWN_DELAY_MS)
    }
  }
}

/** Force channel recreation (e.g. after tab becomes visible). */
export async function reconnectMessagesChannel(): Promise<void> {
  if (subscriberCount === 0) return
  clearReconnectTimer()
  reconnectAttempts = 0
  await teardownChannel()
  createAndSubscribe()
}
