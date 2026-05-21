interface OnlineStatusProps {
  isOnline: boolean
  userName: string
}

export function OnlineStatus({ isOnline, userName }: OnlineStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full transition-colors ${
          isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-chat-muted'
        }`}
        aria-hidden
      />
      <span className="text-sm text-chat-muted">
        {isOnline ? 'Online' : 'Offline'} · {userName}
      </span>
    </div>
  )
}
