// /app/concierge/state/hooks/useConversationMemory.ts

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type { ConversationMessage } from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 REACT
========================================= */

import { useState } from 'react'

/* =========================================
🔥 Conversation Memory Hook
========================================= */

export function useConversationMemory(initialMessages: ConversationMessage[] = []) {

  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages)

  const appendMessage = (message: ConversationMessage) => {
    setMessages(prev => [...prev, message])
  }

  const resetMemory = () => {
    setMessages([])
  }

  return {
    messages,
    appendMessage,
    resetMemory,
  }
}