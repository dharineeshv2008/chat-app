import { useState, type FormEvent } from 'react'

interface AccessCardProps {
  onSubmit: (code: string) => void
  error: string | null
}

export function AccessCard({ onSubmit, error }: AccessCardProps) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(code.trim())
  }

  return (
    <div className="animate-fade-in w-full max-w-md rounded-2xl border border-chat-border bg-chat-panel p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-chat-accent/20">
          <svg
            className="h-7 w-7 text-chat-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-white">Private Chat</h1>
        <p className="mt-2 text-sm text-chat-muted">
          Enter your secret access code to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="access-code" className="sr-only">
            Access code
          </label>
          <input
            id="access-code"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            autoComplete="off"
            className="w-full rounded-xl border border-chat-border bg-chat-surface px-4 py-3 text-white placeholder:text-chat-muted transition focus:border-chat-accent focus:outline-none focus:ring-2 focus:ring-chat-accent/30"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-400"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!code.trim()}
          className="w-full rounded-xl bg-chat-accent py-3 font-medium text-white transition hover:bg-chat-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enter
        </button>
      </form>
    </div>
  )
}
