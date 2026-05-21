import { useEffect, useRef } from 'react'

interface ChatMenuProps {
  open: boolean
  onClose: () => void
  onClearForMe: () => void
  onClearForEveryone: () => void
}

export function ChatMenu({
  open,
  onClose,
  onClearForMe,
  onClearForEveryone,
}: ChatMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" aria-hidden onClick={onClose} />
      <div
        ref={ref}
        role="menu"
        className="animate-fade-in absolute right-4 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-chat-border bg-chat-panel py-1 shadow-2xl sm:right-6"
      >
        <button
          type="button"
          role="menuitem"
          className="flex w-full px-4 py-2.5 text-left text-sm text-[#e9edef] transition hover:bg-chat-surface"
          onClick={() => {
            onClearForMe()
            onClose()
          }}
        >
          Clear chat for me
        </button>
        <button
          type="button"
          role="menuitem"
          className="flex w-full px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
          onClick={() => {
            onClearForEveryone()
            onClose()
          }}
        >
          Clear chat for everyone
        </button>
      </div>
    </>
  )
}
