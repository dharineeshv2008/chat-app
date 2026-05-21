import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { canDeleteForEveryone, getDeleteEveryoneSecondsLeft } from '../lib/deleteUtils'
import type { Message, UserName } from '../types'

interface MessageActionsMenuProps {
  message: Message
  currentUser: UserName
  x: number
  y: number
  onClose: () => void
  onDeleteForEveryone: (messageId: string) => void
  onDeleteForMe: (messageId: string) => void
}

export function MessageActionsMenu({
  message,
  currentUser,
  x,
  y,
  onClose,
  onDeleteForEveryone,
  onDeleteForMe,
}: MessageActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: x, top: y })
  const [secondsLeft, setSecondsLeft] = useState(() =>
    getDeleteEveryoneSecondsLeft(message),
  )

  const isOwn = message.sender === currentUser
  const showDeleteEveryone =
    isOwn &&
    !message.deleted_for_everyone &&
    canDeleteForEveryone(message, currentUser)

  useEffect(() => {
    if (!showDeleteEveryone) return

    const tick = () => {
      const left = getDeleteEveryoneSecondsLeft(message)
      setSecondsLeft(left)
      if (left <= 0) onClose()
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [message, showDeleteEveryone, onClose])

  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const padding = 8
    let left = x
    let top = y

    if (left + rect.width > window.innerWidth - padding) {
      left = window.innerWidth - rect.width - padding
    }
    if (top + rect.height > window.innerHeight - padding) {
      top = y - rect.height
    }
    if (top < padding) top = padding
    if (left < padding) left = padding

    setPosition({ left, top })
  }, [x, y, showDeleteEveryone])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) onClose()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('touchstart', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('touchstart', onPointer)
    }
  }, [onClose])

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={menuRef}
        role="menu"
        className="animate-fade-in fixed z-50 min-w-[220px] overflow-hidden rounded-xl border border-chat-border bg-chat-panel py-1 shadow-2xl"
        style={{ left: position.left, top: position.top }}
      >
        {showDeleteEveryone && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
            onClick={() => {
              onDeleteForEveryone(message.id)
              onClose()
            }}
          >
            <span>Delete for everyone</span>
            <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-medium tabular-nums text-red-300">
              {secondsLeft}s
            </span>
          </button>
        )}

        <button
          type="button"
          role="menuitem"
          className="flex w-full px-4 py-2.5 text-left text-sm text-[#e9edef] transition hover:bg-chat-surface"
          onClick={() => {
            onDeleteForMe(message.id)
            onClose()
          }}
        >
          Delete for me
        </button>
      </div>
    </>
  )
}
