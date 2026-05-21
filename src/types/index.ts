export type UserName = 'John' | 'Friend'

export interface Message {
  id: string
  sender: UserName
  text: string
  created_at: string
  deleted_for_everyone: boolean
  deleted_at: string | null
}

export interface TypingPayload {
  user: UserName
  isTyping: boolean
}

export interface MessageMenuState {
  messageId: string
  x: number
  y: number
}
