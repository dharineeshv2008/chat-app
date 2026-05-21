export const ACCESS_CODE = '1234VD'

export const USERS = ['John', 'Friend'] as const

export const SESSION_KEYS = {
  access: 'private_chat_access',
  user: 'private_chat_user',
} as const

export const REALTIME_CHANNEL = 'private-chat-room'

/** WhatsApp-style window for "Delete for everyone" */
export const DELETE_FOR_EVERYONE_MS = 60 * 1000

export const DELETED_MESSAGE_LABEL = 'This message was deleted'

/** @deprecated use CHAT_LOCAL_STATE_KEY */
export const HIDDEN_MESSAGES_KEY = 'private_chat_hidden_messages'

export const CHAT_LOCAL_STATE_KEY = 'private_chat_local_state'
