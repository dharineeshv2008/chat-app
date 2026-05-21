interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        role="alertdialog"
        aria-labelledby="confirm-title"
        className="animate-fade-in w-full max-w-sm rounded-2xl border border-chat-border bg-chat-panel p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-chat-muted">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-chat-border py-2.5 text-sm text-[#e9edef] transition hover:bg-chat-surface"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition ${
              destructive
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-chat-accent hover:bg-chat-accent-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
