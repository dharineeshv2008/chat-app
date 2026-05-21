import { DELETED_MESSAGE_LABEL } from '../lib/constants'
import { useLongPress } from '../hooks/useLongPress'
import type { Message, UserName } from '../types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onOpenMenu: (message: Message, clientX: number, clientY: number) => void
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageBubble({ message, isOwn, onOpenMenu }: MessageBubbleProps) {
  const isDeleted = message.deleted_for_everyone

  const openMenu = (clientX: number, clientY: number) => {
    onOpenMenu(message, clientX, clientY)
  }

  const longPress = useLongPress((clientX, clientY) => {
    openMenu(clientX, clientY)
  })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    openMenu(e.clientX, e.clientY)
  }

  return (
    <div
      className={`flex animate-fade-in select-none touch-manipulation ${isOwn ? 'justify-end' : 'justify-start'}`}
      onContextMenu={handleContextMenu}
      {...longPress}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[70%] ${
          isDeleted
            ? 'rounded-2xl border border-chat-border/60 bg-chat-surface/80'
            : isOwn
              ? 'rounded-br-md bg-bubble-sent text-white'
              : 'rounded-bl-md bg-bubble-received text-[#e9edef]'
        }`}
      >
        {!isOwn && !isDeleted && (
          <p className="mb-0.5 text-xs font-medium text-chat-accent">
            {message.sender as UserName}
          </p>
        )}

        {isDeleted ? (
          <p className="text-[14px] italic leading-relaxed text-chat-muted">
            {DELETED_MESSAGE_LABEL}
          </p>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
            {message.text}
          </p>
        )}

        <p
          className={`mt-1 text-right text-[11px] ${
            isDeleted
              ? 'text-chat-muted/80'
              : isOwn
                ? 'text-emerald-200/70'
                : 'text-chat-muted'
          }`}
        >
          {formatTime(message.deleted_at ?? message.created_at)}
        </p>
      </div>
    </div>
  )
}
