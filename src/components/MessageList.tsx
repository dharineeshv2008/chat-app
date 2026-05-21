import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { filterVisibleMessages } from '../lib/messages'
import { MessageActionsMenu } from './MessageActionsMenu'
import { MessageBubble } from './MessageBubble'
import type { Message, MessageMenuState, UserName } from '../types'

interface MessageListProps {
  messages: Message[]
  currentUser: UserName
  loading: boolean
  hiddenIds: Set<string>
  onDeleteForEveryone: (messageId: string) => void | Promise<boolean>
  onDeleteForMe: (messageId: string) => void
}

export function MessageList({
  messages,
  currentUser,
  loading,
  hiddenIds,
  onDeleteForEveryone,
  onDeleteForMe,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState<MessageMenuState | null>(null)

  const visibleMessages = useMemo(
    () => filterVisibleMessages(messages, hiddenIds),
    [messages, hiddenIds],
  )

  const hasHiddenOnly =
    !loading && messages.length > 0 && visibleMessages.length === 0

  const menuMessage = useMemo(
    () => (menu ? messages.find((m) => m.id === menu.messageId) : null),
    [menu, messages],
  )

  useAutoScroll(visibleMessages, bottomRef, !loading)

  useEffect(() => {
    setMenu(null)
  }, [messages])

  const handleOpenMenu = useCallback(
    (message: Message, clientX: number, clientY: number) => {
      if (loading) return
      setMenu({ messageId: message.id, x: clientX, y: clientY })
    },
    [loading],
  )

  const handleDeleteForMe = useCallback(
    (messageId: string) => {
      onDeleteForMe(messageId)
      setMenu(null)
    },
    [onDeleteForMe],
  )

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
            You deleted all messages on your side. The other person may still see them.
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
              onOpenMenu={handleOpenMenu}
            />
          ))}
          <div ref={bottomRef} className="h-px shrink-0" />
        </div>
      )}

      {menu && menuMessage && (
        <MessageActionsMenu
          message={menuMessage}
          currentUser={currentUser}
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onDeleteForEveryone={(id) => void onDeleteForEveryone(id)}
          onDeleteForMe={handleDeleteForMe}
        />
      )}
    </div>
  )
}
