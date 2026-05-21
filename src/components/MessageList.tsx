import { useMemo, useRef } from 'react'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { filterVisibleMessages } from '../lib/messages'
import { MessageBubble } from './MessageBubble'
import type { Message, UserName } from '../types'

interface MessageListProps {
  messages: Message[]
  currentUser: UserName
  loading: boolean
  hiddenIds: Set<string>
  clearedAt: string | null
  selectionMode: boolean
  isSelected: (id: string) => boolean
  onEnterSelection: (messageId: string) => void
  onToggleSelect: (messageId: string) => void
}

export function MessageList({
  messages,
  currentUser,
  loading,
  hiddenIds,
  clearedAt,
  selectionMode,
  isSelected,
  onEnterSelection,
  onToggleSelect,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const visibleMessages = useMemo(
    () => filterVisibleMessages(messages, hiddenIds, clearedAt),
    [messages, hiddenIds, clearedAt],
  )

  const hasHiddenOnly =
    !loading && messages.length > 0 && visibleMessages.length === 0

  useAutoScroll(visibleMessages, bottomRef, !loading && !selectionMode)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-chat-accent border-t-transparent" />
        </div>
      ) : hasHiddenOnly ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-chat-muted">No visible messages</p>
          <p className="text-sm text-chat-muted/70">
            Chat cleared or hidden on your device. The other person may still see messages.
          </p>
        </div>
      ) : visibleMessages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-chat-muted">No messages yet</p>
          <p className="text-sm text-chat-muted/70">
            Say hello to start the conversation
          </p>
        </div>
      ) : (
        <div
          className="scrollbar-thin flex min-h-0 flex-1 touch-pan-y flex-col gap-2 overflow-y-auto px-3 py-4 sm:px-6"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {visibleMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender === currentUser}
              selectionMode={selectionMode}
              selected={isSelected(message.id)}
              onEnterSelection={onEnterSelection}
              onToggleSelect={onToggleSelect}
            />
          ))}
          <div ref={bottomRef} className="h-px shrink-0" />
        </div>
      )}
    </div>
  )
}
