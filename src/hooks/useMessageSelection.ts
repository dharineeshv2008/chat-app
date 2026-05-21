import { useCallback, useState } from 'react'

export function useMessageSelection() {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const enterSelection = useCallback((messageId?: string) => {
    setSelectionMode(true)
    if (messageId) {
      setSelectedIds(new Set([messageId]))
    }
  }, [])

  const exitSelection = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const toggleSelection = useCallback((messageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(messageId)) next.delete(messageId)
      else next.add(messageId)
      return next
    })
  }, [])

  const isSelected = useCallback(
    (messageId: string) => selectedIds.has(messageId),
    [selectedIds],
  )

  return {
    selectionMode,
    selectedIds,
    selectedCount: selectedIds.size,
    enterSelection,
    exitSelection,
    toggleSelection,
    isSelected,
  }
}
