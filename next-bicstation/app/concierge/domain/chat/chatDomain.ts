// /app/concierge/domain/chat/chatDomain.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '@/app/concierge/contracts/conversation/ConversationState'

/* =========================================
🔥 Chat Domain
========================================= */

export const ChatDomain = {

  /* =====================================
  Create Message
  ===================================== */

  createMessage({
    role,
    content,
  }: {
    role: 'user' | 'assistant'
    content: string
  }): ConversationMessage {

    return {

      id:
        crypto.randomUUID(),

      role,

      content,

      created_at:
        new Date()
          .toISOString(),

    }
  },

  /* =====================================
  Create State
  ===================================== */

  createState(): ConversationState {

    return {

      status:
        'idle',

      messages: [],

      error:
        null,

    }
  },

  /* =====================================
  Add Message
  ===================================== */

  addMessage({
    state,
    message,
  }: {
    state: ConversationState
    message: ConversationMessage
  }): ConversationState {

    return {

      ...state,

      messages: [

        ...(state?.messages || []),

        message,

      ],

    }
  },

  /* =====================================
  Update Status
  ===================================== */

  updateStatus({
    state,
    status,
  }: {
    state: ConversationState
    status:
      | 'idle'
      | 'processing'
      | 'success'
      | 'error'
  }): ConversationState {

    return {

      ...state,

      status,

    }
  },

  /* =====================================
  Set Error
  ===================================== */

  setError({
    state,
    error,
  }: {
    state: ConversationState
    error?: string | null
  }): ConversationState {

    return {

      ...state,

      status:
        'error',

      error:
        error || null,

    }
  },

  /* =====================================
  Latest Message
  ===================================== */

  getLatestMessage(
    messages:
      ConversationMessage[] = []
  ) {

    return messages[
      messages.length - 1
    ]
  },

  /* =====================================
  User Messages
  ===================================== */

  getUserMessages(
    messages:
      ConversationMessage[] = []
  ) {

    return messages.filter(
      item => (
        item?.role
        === 'user'
      )
    )
  },

  /* =====================================
  Assistant Messages
  ===================================== */

  getAssistantMessages(
    messages:
      ConversationMessage[] = []
  ) {

    return messages.filter(
      item => (
        item?.role
        === 'assistant'
      )
    )
  },

  /* =====================================
  Has Messages
  ===================================== */

  hasMessages(
    messages:
      ConversationMessage[] = []
  ) {

    return messages.length > 0
  },

  /* =====================================
  Message Count
  ===================================== */

  getMessageCount(
    messages:
      ConversationMessage[] = []
  ) {

    return messages.length
  },

  /* =====================================
  Normalize Messages
  ===================================== */

  normalizeMessages(
    messages:
      ConversationMessage[] = []
  ) {

    return Array.isArray(
      messages
    )
      ? messages
      : []
  },
}

export default ChatDomain