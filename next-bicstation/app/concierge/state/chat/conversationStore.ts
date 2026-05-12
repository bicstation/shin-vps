// /app/concierge/state/chat/conversationStore.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type { ConversationMessage } from '../../contracts/conversation/ConversationMessage'

/* =========================================
🔥 STORE
========================================= */

import { useState } from 'react'

/* =========================================
🔥 Conversation Store Hook
========================================= */

export function useConversationStore(initialMessages: ConversationMessage[] = []) {

  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages)

  /* ======================================
  Add message
  ====================================== */

  const addMessage = (message: ConversationMessage) => {
    setMessages(prev => [...prev, message])
  }

  /* ======================================
  Reset conversation
  ====================================== */

  const resetConversation = () => {
    setMessages([])
  }

  return {
    messages,
    addMessage,
    resetConversation,
  }
}