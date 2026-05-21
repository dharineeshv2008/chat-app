import { useCallback, useRef } from 'react'

const LONG_PRESS_MS = 500
const MOVE_TOLERANCE_PX = 12

export function useLongPress(
  onLongPress: (clientX: number, clientY: number) => void,
  enabled = true,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startRef.current = null
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return
      const touch = e.touches[0]
      startRef.current = { x: touch.clientX, y: touch.clientY }
      clear()
      timerRef.current = setTimeout(() => {
        if (startRef.current) {
          onLongPress(startRef.current.x, startRef.current.y)
        }
        clear()
      }, LONG_PRESS_MS)
    },
    [enabled, onLongPress, clear],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startRef.current) return
      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - startRef.current.x)
      const dy = Math.abs(touch.clientY - startRef.current.y)
      if (dx > MOVE_TOLERANCE_PX || dy > MOVE_TOLERANCE_PX) clear()
    },
    [clear],
  )

  const onTouchEnd = useCallback(() => clear(), [clear])

  return { onTouchStart, onTouchMove, onTouchEnd }
}
