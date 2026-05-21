interface TypingIndicatorProps {
  userName: string
  visible: boolean
}

export function TypingIndicator({ userName, visible }: TypingIndicatorProps) {
  if (!visible) return null

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-sm text-chat-muted animate-fade-in">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-chat-muted animate-pulse-dot" />
        <span
          className="h-1.5 w-1.5 rounded-full bg-chat-muted animate-pulse-dot"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-chat-muted animate-pulse-dot"
          style={{ animationDelay: '0.4s' }}
        />
      </span>
      <span>{userName} is typing…</span>
    </div>
  )
}
