interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex shrink-0 items-center justify-between gap-3 bg-red-500/10 px-4 py-2 text-sm text-red-400"
    >
      <p className="flex-1 text-center sm:text-left">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
          aria-label="Dismiss error"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}
