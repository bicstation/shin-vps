// /app/concierge/state/hooks/useConciergeChat.ts

'use client'

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
🔥 REACT
========================================= */

import { useState } from 'react'

/* =========================================
🔥 Concierge Chat Hook
========================================= */

export function useConciergeChat(initialMessages: ConversationMessage[] = []) {

  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages)

  const addMessage = (message: ConversationMessage) => {
    setMessages(prev => [...prev, message])
  }

  const resetMessages = () => {
    setMessages([])
  }

  const appendUserMessage = (text: string, intent?: SemanticIntent) => {

    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      ...intent,
      created_at: new Date().toISOString(),
    }

    addMessage(userMessage)
  }

  const appendSystemMessage = (text: string) => {

    const systemMessage: ConversationMessage = {
      role: 'system',
      content: text,
      created_at: new Date().toISOString(),
    }

    addMessage(systemMessage)
  }

  return {
    messages,
    addMessage,
    resetMessages,
    appendUserMessage,
    appendSystemMessage,
  }
}