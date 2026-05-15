// /app/concierge/domain/memory/memoryDomain.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 Types
========================================= */

type MemoryState = {

  messages:
    ConversationMessage[]

  semanticIntent?:
    SemanticIntent

  lastUpdated?:
    string
}

/* =========================================
🔥 Memory Domain
========================================= */

export const MemoryDomain = {

  /* =====================================
  Create Memory
  ===================================== */

  createMemory(): MemoryState {

    return {

      messages: [],

      semanticIntent:
        undefined,

      lastUpdated:
        new Date()
          .toISOString(),

    }
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

  /* =====================================
  Append Message
  ===================================== */

  appendMessage({
    memory,
    message,
  }: {
    memory: MemoryState
    message: ConversationMessage
  }): MemoryState {

    return {

      ...memory,

      messages: [

        ...(memory?.messages || []),

        message,

      ],

      lastUpdated:
        new Date()
          .toISOString(),

    }
  },

  /* =====================================
  Resolve Latest Message
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
  Save Semantic Intent
  ===================================== */

  saveSemanticIntent({
    memory,
    semanticIntent,
  }: {
    memory: MemoryState
    semanticIntent:
      SemanticIntent
  }): MemoryState {

    return {

      ...memory,

      semanticIntent,

      lastUpdated:
        new Date()
          .toISOString(),

    }
  },

  /* =====================================
  Merge Semantic Intent
  ===================================== */

  mergeSemanticIntent({
    previousIntent,
    nextIntent,
  }: {
    previousIntent?:
      SemanticIntent

    nextIntent?:
      SemanticIntent
  }): SemanticIntent {

    return {

      ...previousIntent,

      ...nextIntent,

    }
  },

  /* =====================================
  Build Conversation Context
  ===================================== */

  buildConversationContext(
    messages:
      ConversationMessage[] = []
  ) {

    const latestMessage =

      this.getLatestMessage(
        messages
      )

    const userMessages =

      this.getUserMessages(
        messages
      )

    return {

      latestMessage,

      totalMessages:
        messages.length,

      userMessageCount:
        userMessages.length,

    }
  },

  /* =====================================
  Clear Memory
  ===================================== */

  clearMemory(): MemoryState {

    return {

      messages: [],

      semanticIntent:
        undefined,

      lastUpdated:
        new Date()
          .toISOString(),

    }
  },
}

export default MemoryDomain