import { useState } from 'react'
import { ChatMenu } from './ChatMenu'
import { OnlineStatus } from './OnlineStatus'
import type { RealtimeConnectionStatus } from '../hooks/useMessages'
import type { UserName } from '../types'

interface ChatHeaderProps {
  currentUser: UserName
  otherUser: UserName
  isOtherOnline: boolean
  connectionStatus?: RealtimeConnectionStatus
  selectionMode?: boolean
  onLogout: () => void
  onClearChatForMe: () => void
  onClearChatForEveryone: () => void
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
  selectionMode = false,
  onLogout,
  onClearChatForMe,
  onClearChatForEveryone,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative flex shrink-0 items-center gap-3 border-b border-chat-border bg-chat-panel px-4 py-3 sm:px-6">
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

      <div className="flex items-center gap-1">
        <span className="hidden rounded-lg bg-chat-surface px-2 py-1 text-xs text-chat-muted sm:inline">
          You: {currentUser}
        </span>

        {!selectionMode && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-chat-muted transition hover:bg-chat-surface hover:text-white"
              aria-label="Chat options"
              aria-expanded={menuOpen}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            <ChatMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onClearForMe={onClearChatForMe}
              onClearForEveryone={onClearChatForEveryone}
            />
          </div>
        )}

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
