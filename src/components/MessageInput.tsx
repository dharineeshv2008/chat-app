import { useState, type FormEvent, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (text: string) => Promise<boolean>
  onTyping: () => void
  onStopTyping: () => void
  disabled?: boolean
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    onStopTyping()
    const ok = await onSend(trimmed)
    setSending(false)

    if (ok) setText('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-end gap-2 border-t border-chat-border bg-chat-panel px-3 py-3 sm:px-4"
    >
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          if (e.target.value.trim()) onTyping()
          else onStopTyping()
        }}
        onKeyDown={handleKeyDown}
        onBlur={onStopTyping}
        placeholder="Type a message"
        rows={1}
        disabled={disabled || sending}
        className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-chat-border bg-chat-surface px-4 py-2.5 text-[15px] text-white placeholder:text-chat-muted transition focus:border-chat-accent focus:outline-none focus:ring-2 focus:ring-chat-accent/20 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || sending || !text.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chat-accent text-white transition hover:bg-chat-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Send message"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  )
}
