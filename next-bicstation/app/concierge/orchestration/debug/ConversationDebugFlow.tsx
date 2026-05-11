// /app/concierge/orchestration/debug/ConversationDebugFlow.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../contracts/conversation/ConversationMessage'

/* =========================================
🔥 DOMAIN
========================================= */

import ConversationDomain
  from '../domain/chat/conversationDomain'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from '../styles/debug.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  enabled?: boolean

  messages?:
    ConversationMessage[]
}

/* =========================================
🔥 Conversation Debug Flow
========================================= */

export default function
ConversationDebugFlow({
  enabled = false,
  messages = [],
}: Props) {

  // ======================================
  // Disabled
  // ======================================

  if (
    !enabled
  ) {

    return null
  }

  // ======================================
  // Runtime Values
  // ======================================

  const latestMessage =

    ConversationDomain
      .getLatestMessage(
        messages
      )

  const userMessages =

    ConversationDomain
      .getUserMessages(
        messages
      )

  const assistantMessages =

    ConversationDomain
      .getAssistantMessages(
        messages
      )

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    totalMessages:
      messages.length,

    userMessages:
      userMessages.length,

    assistantMessages:
      assistantMessages.length,

    latestRole:
      latestMessage?.role
      || null,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Conversation Debug Flow'
  )

  console.log({

    metrics,

    latestMessage,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.debug
      }
    >

      {/* ==================================
      Header
      ================================== */}

      <div
        className={
          styles.debugHeader
        }
      >

        💬 Conversation Debug

      </div>

      {/* ==================================
      Metrics
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Metrics
        </h3>

        <pre>
          {JSON.stringify(

            metrics,

            null,
            2

          )}
        </pre>

      </div>

      {/* ==================================
      Latest Message
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Latest Message
        </h3>

        <pre>
          {JSON.stringify(

            latestMessage,

            null,
            2

          )}
        </pre>

      </div>

      {/* ==================================
      Messages
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          All Messages
        </h3>

        <pre>
          {JSON.stringify(

            messages,

            null,
            2

          )}
        </pre>

      </div>

    </section>
  )
}