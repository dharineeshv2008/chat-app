# Production Audit — Private Chat

## Issues Found & Fixed

### Critical

| Issue | Impact | Fix |
|-------|--------|-----|
| Initial fetch **replaced** state after realtime INSERT | Messages could disappear briefly or permanently | Always `mergeMessages(prev, fetched)` |
| React Strict Mode stale fetch guard too aggressive | Empty chat after load | Request generation + merge instead of skip-setState |
| Typing broadcast before channel subscribed | Typing indicator unreliable | `subscribedRef` gate before `send()` |
| Shared realtime channel name for presence + typing | Potential cross-talk | Separate `-presence` and `-typing` channels |

### High

| Issue | Impact | Fix |
|-------|--------|-----|
| No refetch on tab focus / reconnect | Missed messages after background | `visibilitychange` + refetch on `SUBSCRIBED` |
| `deleteForEveryone` depended on `messages` in closure | Stale message lookup | `messagesRef` for current snapshot |
| Smooth scroll on every render | Janky scroll / flicker | `useAutoScroll` — instant first, smooth only when list grows |
| Flex layout without `min-h-0` | Invisible message area | Preserved from prior fix + `App` wrapper |
| Input enabled while loading | Send before history loads | `disabled={loading}` on `MessageInput` |

### Medium

| Issue | Impact | Fix |
|-------|--------|-----|
| All messages “delete for me” → empty state wrong | Confusing UX | “No visible messages” empty state |
| Errors not dismissible | Stuck red banner | `ErrorBanner` + `clearError` |
| User re-picks identity every visit to `/select` | Annoying if session has user | Auto-redirect to `/chat` if user set |
| Logout without stopping typing | Ghost typing indicator | `stopTyping()` on logout |
| Menu stays open after remote delete | Stale menu | Close menu when `messages` changes |

### Low / Security (documented)

| Item | Notes |
|------|-------|
| Access code in client bundle | Acceptable for 2-user private app; move to Edge Function for stronger gate |
| RLS allows anon UPDATE soft-delete | Mitigated by `.eq('sender')` + DB trigger (1 min, field lock) |
| No Supabase Auth | By design; identity is session-only |

## Verification Checklist

- [ ] Run `supabase/production.sql` in SQL Editor
- [ ] Replication: `messages` enabled for INSERT + UPDATE
- [ ] Two browsers: John + Friend
- [ ] Send / receive realtime
- [ ] Delete for everyone < 60s
- [ ] Delete for me (other user still sees)
- [ ] Refresh / reconnect
- [ ] Mobile long-press menu

## Suggested Production Improvements

1. Supabase Edge Function to validate access code server-side
2. Rate limiting on inserts (Supabase hooks or Edge)
3. `VITE_` env only on Vercel; rotate keys if exposed
4. Optional message pagination for long histories
5. E2E tests (Playwright) for send/delete/realtime
