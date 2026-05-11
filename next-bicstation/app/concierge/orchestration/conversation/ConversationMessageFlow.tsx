// /app/concierge/orchestration/conversation/ConversationMessageFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../contracts/conversation/ConversationMessage'

/* =========================================
🔥 SECTIONS
========================================= */

import ChatSection
  from '../sections/chat/ChatSection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: ConversationMessage[]
}

/* =========================================
🔥 Conversation Message Flow
========================================= */

export default function
ConversationMessageFlow({
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
  // Sorted Messages
  // ======================================

  const sortedMessages =

    useMemo(() => (

      [...safeMessages].sort(
        (a, b) => {

          const timeA =

            new Date(
              a?.created_at
              || 0
            ).getTime()

          const timeB =

            new Date(
              b?.created_at
              || 0
            ).getTime()

          return (
            timeA - timeB
          )
        }
      )

    ), [safeMessages])

  // ======================================
  // Latest Message
  // ======================================

  const latestMessage =

    useMemo(() => (

      sortedMessages[
        sortedMessages.length - 1
      ]

    ), [sortedMessages])

  // ======================================
  // Message Stats
  // ======================================

  const stats =

    useMemo(() => {

      const userCount =

        sortedMessages.filter(
          item => (
            item?.role
            === 'user'
          )
        ).length

      const assistantCount =

        sortedMessages.filter(
          item => (
            item?.role
            === 'assistant'
          )
        ).length

      return {

        total:
          sortedMessages.length,

        user:
          userCount,

        assistant:
          assistantCount,

      }

    }, [sortedMessages])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Conversation Message Flow'
  )

  console.log({

    latestMessage:
      latestMessage?.content
        ?.slice(0, 60),

    stats,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <ChatSection

      messages={
        sortedMessages
      }

    />

  )
}