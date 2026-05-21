import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCard } from '../components/UserCard'
import { getCurrentUser, setCurrentUser } from '../lib/auth'
import type { UserName } from '../types'

export function UserSelectPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<UserName | null>(null)

  useEffect(() => {
    const existing = getCurrentUser()
    if (existing) {
      navigate('/chat', { replace: true })
    }
  }, [navigate])

  const handleContinue = () => {
    if (!selected) return
    setCurrentUser(selected)
    navigate('/chat', { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-chat-bg px-4 py-12">
      <div className="animate-fade-in w-full max-w-md rounded-2xl border border-chat-border bg-chat-panel p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">Who are you?</h1>
          <p className="mt-2 text-sm text-chat-muted">
            Select your identity to enter the chat
          </p>
        </div>

        <div className="space-y-3">
          <UserCard
            name="John"
            selected={selected === 'John'}
            onSelect={setSelected}
          />
          <UserCard
            name="Friend"
            selected={selected === 'Friend'}
            onSelect={setSelected}
          />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className="mt-6 w-full rounded-xl bg-chat-accent py-3 font-medium text-white transition hover:bg-chat-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to chat
        </button>
      </div>
    </div>
  )
}
