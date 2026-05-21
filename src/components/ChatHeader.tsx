import { OnlineStatus } from './OnlineStatus'
import type { UserName } from '../types'

interface ChatHeaderProps {
  currentUser: UserName
  otherUser: UserName
  isOtherOnline: boolean
  onLogout: () => void
}

const AVATAR_COLORS: Record<UserName, string> = {
  John: 'bg-blue-600',
  Friend: 'bg-emerald-600',
}

export function ChatHeader({
  currentUser,
  otherUser,
  isOtherOnline,
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
        <OnlineStatus isOnline={isOtherOnline} userName={otherUser} />
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
