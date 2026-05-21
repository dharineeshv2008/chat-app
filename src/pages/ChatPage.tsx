import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatHeader } from '../components/ChatHeader'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ErrorBanner } from '../components/ErrorBanner'
import { MessageInput } from '../components/MessageInput'
import { MessageList } from '../components/MessageList'
import { SelectionToolbar } from '../components/SelectionToolbar'
import { TypingIndicator } from '../components/TypingIndicator'
import { useChatLocalState } from '../hooks/useChatLocalState'
import { useMessageSelection } from '../hooks/useMessageSelection'
import { useMessages } from '../hooks/useMessages'
import { usePresence } from '../hooks/usePresence'
import { useTyping } from '../hooks/useTyping'
import { canBulkDeleteForEveryone } from '../lib/deleteUtils'
import { getCurrentUser, revokeAccess } from '../lib/auth'
import type { UserName } from '../types'

function getOtherUser(user: UserName): UserName {
  return user === 'John' ? 'Friend' : 'John'
}

type ConfirmKind = 'clearMe' | 'clearEveryone' | null

export function ChatPage() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()!

  const otherUser = getOtherUser(currentUser)
  const {
    messages,
    loading,
    error,
    connectionStatus,
    sendMessage,
    deleteManyForEveryone,
    clearAllForEveryone,
    clearError,
  } = useMessages(currentUser)

  const { hiddenIds, clearedAt, hideManyForMe, clearChatForMe } =
    useChatLocalState(currentUser)

  const {
    selectionMode,
    selectedIds,
    selectedCount,
    enterSelection,
    exitSelection,
    toggleSelection,
    isSelected,
  } = useMessageSelection()

  const { isOtherOnline } = usePresence(currentUser)
  const { isOtherTyping, notifyTyping, stopTyping } = useTyping(
    currentUser,
    otherUser,
  )

  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null)

  const selectedIdList = useMemo(() => [...selectedIds], [selectedIds])

  const canDeleteSelectedForEveryone = useMemo(
    () => canBulkDeleteForEveryone(messages, selectedIdList, currentUser),
    [messages, selectedIdList, currentUser],
  )

  const handleEnterSelection = useCallback(
    (messageId: string) => {
      enterSelection(messageId)
    },
    [enterSelection],
  )

  const handleDeleteSelectedForMe = useCallback(() => {
    if (selectedIdList.length === 0) return
    hideManyForMe(selectedIdList)
    exitSelection()
  }, [selectedIdList, hideManyForMe, exitSelection])

  const handleDeleteSelectedForEveryone = useCallback(async () => {
    if (selectedIdList.length === 0) return
    const ok = await deleteManyForEveryone(selectedIdList)
    if (ok) exitSelection()
  }, [selectedIdList, deleteManyForEveryone, exitSelection])

  const handleConfirmClearMe = useCallback(() => {
    clearChatForMe()
    setConfirmKind(null)
    exitSelection()
  }, [clearChatForMe, exitSelection])

  const handleConfirmClearEveryone = useCallback(async () => {
    setConfirmKind(null)
    const ok = await clearAllForEveryone()
    if (ok) exitSelection()
  }, [clearAllForEveryone, exitSelection])

  const handleLogout = () => {
    stopTyping()
    revokeAccess()
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (!selectionMode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitSelection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectionMode, exitSelection])

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-chat-bg">
      <ChatHeader
        currentUser={currentUser}
        otherUser={otherUser}
        isOtherOnline={isOtherOnline(otherUser)}
        connectionStatus={connectionStatus}
        selectionMode={selectionMode}
        onLogout={handleLogout}
        onClearChatForMe={() => setConfirmKind('clearMe')}
        onClearChatForEveryone={() => setConfirmKind('clearEveryone')}
      />

      {selectionMode && (
        <SelectionToolbar
          selectedCount={selectedCount}
          canDeleteForEveryone={canDeleteSelectedForEveryone}
          onCancel={exitSelection}
          onDeleteForMe={handleDeleteSelectedForMe}
          onDeleteForEveryone={() => void handleDeleteSelectedForEveryone()}
        />
      )}

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          loading={loading}
          hiddenIds={hiddenIds}
          clearedAt={clearedAt}
          selectionMode={selectionMode}
          isSelected={isSelected}
          onEnterSelection={handleEnterSelection}
          onToggleSelect={toggleSelection}
        />
        <TypingIndicator userName={otherUser} visible={isOtherTyping && !selectionMode} />
        <MessageInput
          onSend={sendMessage}
          onTyping={notifyTyping}
          onStopTyping={stopTyping}
          disabled={loading || selectionMode}
        />
      </main>

      <ConfirmDialog
        open={confirmKind === 'clearMe'}
        title="Clear chat for me?"
        description="This removes all messages from your screen only. The other person will still see the full chat history."
        confirmLabel="Clear for me"
        onConfirm={handleConfirmClearMe}
        onCancel={() => setConfirmKind(null)}
      />

      <ConfirmDialog
        open={confirmKind === 'clearEveryone'}
        title="Clear chat for everyone?"
        description="This permanently deletes all messages from the database for both users. This cannot be undone."
        confirmLabel="Delete all"
        destructive
        onConfirm={() => void handleConfirmClearEveryone()}
        onCancel={() => setConfirmKind(null)}
      />
    </div>
  )
}
