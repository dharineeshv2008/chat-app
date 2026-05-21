import type { UserName } from '../types'

interface UserCardProps {
  name: UserName
  selected: boolean
  onSelect: (name: UserName) => void
}

const AVATAR_COLORS: Record<UserName, string> = {
  John: 'bg-blue-600',
  Friend: 'bg-emerald-600',
}

export function UserCard({ name, selected, onSelect }: UserCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(name)}
      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
        selected
          ? 'border-chat-accent bg-chat-accent/10 shadow-lg shadow-chat-accent/10'
          : 'border-chat-border bg-chat-surface hover:border-chat-muted'
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ${AVATAR_COLORS[name]}`}
      >
        {name[0]}
      </div>
      <div>
        <p className="font-medium text-white">{name}</p>
        <p className="text-sm text-chat-muted">
          {name === 'John' ? 'User 1' : 'User 2'}
        </p>
      </div>
      {selected && (
        <svg
          className="ml-auto h-5 w-5 text-chat-accent"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  )
}
