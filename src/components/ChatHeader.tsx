import { OnlineStatus } from './OnlineStatus'
import type { RealtimeConnectionStatus } from '../hooks/useMessages'
import type { UserName } from '../types'

interface ChatHeaderProps {
  currentUser: UserName
  otherUser: UserName
  isOtherOnline: boolean
  connectionStatus?: RealtimeConnectionStatus
  onLogout: () => void
}

const AVATAR_COLORS: Record<UserName, string> = {
  John: 'bg-blue-600',
  Friend: 'bg-emerald-600',
}

function LiveIndicator({ status }: { status?: RealtimeConnectionStatus }) {
  if (!status || status === 'connected') return null
  const label =
    status === 'connecting' ? 'Connecting…' : status === 'error' ? 'Offline' : 'Syncing…'
  const color =
    status === 'error' ? 'bg-amber-400' : 'bg-yellow-400 animate-pulse'

  return (
    <span className="flex items-center gap-1.5 text-xs text-chat-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
  )
}

export function ChatHeader({
  currentUser,
  otherUser,
  isOtherOnline,
  connectionStatus,
  onLogout,
}: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-chat-border bg-chat-panel px-4 py-3 sm:px-6">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${AVATAR_COLORS[otherUser]}`}
      >
        {otherUser[0]}
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold text-white">{otherUser}</h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <OnlineStatus isOnline={isOtherOnline} userName={otherUser} />
          <LiveIndicator status={connectionStatus} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-lg bg-chat-surface px-2 py-1 text-xs text-chat-muted sm:inline">
          You: {currentUser}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-chat-border px-3 py-1.5 text-sm text-chat-muted transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
