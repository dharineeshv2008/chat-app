/** Dev-only logging — stripped from production behavior concerns (no-op in prod). */
export function debugLog(scope: string, ...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log(`[${scope}]`, ...args)
  }
}
