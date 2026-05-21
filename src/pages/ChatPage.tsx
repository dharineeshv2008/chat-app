import { useNavigate } from 'react-router-dom'
import { ChatHeader } from '../components/ChatHeader'
import { ErrorBanner } from '../components/ErrorBanner'
import { MessageInput } from '../components/MessageInput'
import { MessageList } from '../components/MessageList'
import { TypingIndicator } from '../components/TypingIndicator'
import { useHiddenMessages } from '../hooks/useHiddenMessages'
import { useMessages } from '../hooks/useMessages'
import { usePresence } from '../hooks/usePresence'
import { useTyping } from '../hooks/useTyping'
import { getCurrentUser, revokeAccess } from '../lib/auth'
import type { UserName } from '../types'

function getOtherUser(user: UserName): UserName {
  return user === 'John' ? 'Friend' : 'John'
}

export function ChatPage() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()!

  const otherUser = getOtherUser(currentUser)
  const {
    messages,
    loading,
    error,
    sendMessage,
    deleteForEveryone,
    clearError,
  } = useMessages(currentUser)
  const { hiddenIds, hideForMe } = useHiddenMessages(currentUser)
  const { isOtherOnline } = usePresence(currentUser)
  const { isOtherTyping, notifyTyping, stopTyping } = useTyping(
    currentUser,
    otherUser,
  )

  const handleLogout = () => {
    stopTyping()
    revokeAccess()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-chat-bg">
      <ChatHeader
        currentUser={currentUser}
        otherUser={otherUser}
        isOtherOnline={isOtherOnline(otherUser)}
        onLogout={handleLogout}
      />

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          loading={loading}
          hiddenIds={hiddenIds}
          onDeleteForEveryone={deleteForEveryone}
          onDeleteForMe={hideForMe}
        />
        <TypingIndicator userName={otherUser} visible={isOtherTyping} />
        <MessageInput
          onSend={sendMessage}
          onTyping={notifyTyping}
          onStopTyping={stopTyping}
          disabled={loading}
        />
      </main>
    </div>
  )
}
