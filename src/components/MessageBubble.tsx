import { DELETED_MESSAGE_LABEL } from '../lib/constants'
import { useLongPress } from '../hooks/useLongPress'
import type { Message, UserName } from '../types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  selectionMode: boolean
  selected: boolean
  onEnterSelection: (messageId: string) => void
  onToggleSelect: (messageId: string) => void
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageBubble({
  message,
  isOwn,
  selectionMode,
  selected,
  onEnterSelection,
  onToggleSelect,
}: MessageBubbleProps) {
  const isDeleted = message.deleted_for_everyone

  const longPress = useLongPress(() => {
    onEnterSelection(message.id)
  })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onEnterSelection(message.id)
  }

  const handleClick = () => {
    if (selectionMode) onToggleSelect(message.id)
  }

  return (
    <div
      className={`flex animate-fade-in select-none touch-manipulation ${
        isOwn ? 'justify-end' : 'justify-start'
      } ${selected ? 'rounded-lg bg-chat-accent/10 ring-1 ring-chat-accent/40' : ''}`}
      onContextMenu={handleContextMenu}
      onClick={selectionMode ? handleClick : undefined}
      {...(selectionMode ? {} : longPress)}
    >
      {selectionMode && (
        <div
          className={`mr-2 flex shrink-0 items-center self-center sm:mr-3 ${
            isOwn ? 'order-2 ml-2 mr-0 sm:ml-3' : ''
          }`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
              selected
                ? 'border-chat-accent bg-chat-accent'
                : 'border-chat-muted bg-transparent'
            }`}
            aria-hidden
          >
            {selected && (
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        </div>
      )}

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
