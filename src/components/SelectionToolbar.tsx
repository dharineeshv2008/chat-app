interface SelectionToolbarProps {
  selectedCount: number
  canDeleteForEveryone: boolean
  onCancel: () => void
  onDeleteForMe: () => void
  onDeleteForEveryone: () => void
}

export function SelectionToolbar({
  selectedCount,
  canDeleteForEveryone,
  onCancel,
  onDeleteForMe,
  onDeleteForEveryone,
}: SelectionToolbarProps) {
  const disabled = selectedCount === 0

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-chat-border bg-chat-panel px-3 py-2.5 sm:px-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-chat-muted transition hover:bg-chat-surface hover:text-white"
        aria-label="Cancel selection"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <p className="min-w-0 flex-1 text-sm font-medium text-white">
        {selectedCount} selected
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={onDeleteForMe}
        className="rounded-lg px-3 py-1.5 text-xs text-[#e9edef] transition hover:bg-chat-surface disabled:opacity-40 sm:text-sm"
      >
        Delete for me
      </button>

      {canDeleteForEveryone && (
        <button
          type="button"
          disabled={disabled}
          onClick={onDeleteForEveryone}
          className="rounded-lg px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-40 sm:text-sm"
        >
          Delete for all
        </button>
      )}
    </div>
  )
}
