// /app/concierge/orchestration/conversation/ConciergeConversationFlow.tsx
// /app/concierge/orchestration/conversation/ConciergeConversationFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 AGENT FLOW
========================================= */

import SemanticAgentFlow
  from '@/app/concierge/orchestration/agent/SemanticAgentFlow'

import RecommendationAgentFlow
  from '@/app/concierge/orchestration/agent/RecommendationAgentFlow'

/* =========================================
🔥 SECTIONS
========================================= */

import ChatSection
  from '@/app/concierge/sections/chat/ChatSection'

import InputSection
  from '@/app/concierge/sections/input/InputSection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: ConversationMessage[]
}

/* =========================================
🔥 Concierge Conversation Flow
========================================= */

export default function
ConciergeConversationFlow({
  messages = [],
}: Props) {

  // ======================================
  // Safe Messages
  // ======================================

  const safeMessages =

    useMemo(() => (

      Array.isArray(messages)
        ? messages
        : []

    ), [messages])

  // ======================================
  // User Messages
  // ======================================

  const userMessages =

    useMemo(() => (

      safeMessages.filter(
        item => (

          item?.role
          === 'user'

        )
      )

    ), [safeMessages])

  // ======================================
  // Assistant Messages
  // ======================================

  const assistantMessages =

    useMemo(() => (

      safeMessages.filter(
        item => (

          item?.role
          === 'assistant'

        )
      )

    ), [safeMessages])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Concierge Conversation Flow'
  )

  console.log({

    totalMessages:
      safeMessages.length,

    userMessages:
      userMessages.length,

    assistantMessages:
      assistantMessages.length,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      CHAT UI
      ================================== */}

      <ChatSection

        messages={
          safeMessages
        }

      />

      {/* ==================================
      INPUT
      ================================== */}

      <InputSection />

      {/* ==================================
      SEMANTIC AGENT
      ================================== */}

      <SemanticAgentFlow

        messages={
          safeMessages
        }

      />

      {/* ==================================
      RECOMMENDATION AGENT
      ================================== */}

      <RecommendationAgentFlow

        messages={
          safeMessages
        }

      />

    </>

  )
}