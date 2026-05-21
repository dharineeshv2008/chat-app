import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccessCard } from '../components/AccessCard'
import { ACCESS_CODE } from '../lib/constants'
import { grantAccess } from '../lib/auth'

export function LandingPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (code: string) => {
    if (code === ACCESS_CODE) {
      grantAccess()
      setError(null)
      navigate('/select', { replace: true })
    } else {
      setError('Invalid access code. Please try again.')
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-chat-bg px-4 py-12">
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #00a88422 0%, transparent 50%), radial-gradient(circle at 80% 80%, #005c4b22 0%, transparent 50%)',
        }}
      />
      <AccessCard onSubmit={handleSubmit} error={error} />
      <p className="relative mt-8 text-xs text-chat-muted">
        Private chat for authorized users only
      </p>
    </div>
  )
}
