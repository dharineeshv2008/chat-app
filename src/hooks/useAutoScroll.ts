import { useEffect, useRef } from 'react'

/**
 * Scrolls to bottom when new messages arrive.
 * Uses instant scroll on first paint, smooth scroll for subsequent updates.
 */
export function useAutoScroll<T>(
  dependency: T,
  bottomRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const isFirstScroll = useRef(true)
  const prevLengthRef = useRef(0)

  useEffect(() => {
    if (!enabled || !bottomRef.current) return

    const length = Array.isArray(dependency) ? dependency.length : 0
    const grew = length > prevLengthRef.current
    prevLengthRef.current = length

    if (length === 0) return

    const behavior =
      isFirstScroll.current || !grew ? ('instant' as ScrollBehavior) : 'smooth'
    bottomRef.current.scrollIntoView({ behavior, block: 'end' })
    isFirstScroll.current = false
  }, [dependency, enabled, bottomRef])
}
