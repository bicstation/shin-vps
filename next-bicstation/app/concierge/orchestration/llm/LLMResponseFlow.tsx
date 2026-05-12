// /app/concierge/orchestration/llm/LLMResponseFlow.tsx

'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

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
🔥 ADAPTER
========================================= */

import OpenAIAdapter
  from '../../transport/adapters/openaiAdapter'

/* =========================================
🔥 COMPONENTS
========================================= */

import TypingIndicator
  from '../../components/TypingIndicator'

import ConciergeError
  from '../../components/ConciergeError'

import ChatMessage
  from '../../components/ChatMessage'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  semanticIntent?:
    SemanticIntent

  onComplete?: (
    message:
      ConversationMessage
  ) => void
}

/* =========================================
🔥 LLM Response Flow
========================================= */

export default function
LLMResponseFlow({
  messages = [],
  semanticIntent,
  onComplete,
}: Props) {

  // ======================================
  // State
  // ======================================

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    assistantMessage,
    setAssistantMessage,
  ] = useState<
    ConversationMessage | null
  >(null)

  // ======================================
  // Latest User Message
  // ======================================

  const latestMessage =

    useMemo(() => (

      messages
        .filter(
          item => (
            item?.role
            === 'user'
          )
        )
        ?.slice(-1)?.[0]

    ), [messages])

  // ======================================
  // Execute Runtime
  // ======================================

  useEffect(() => {

    if (
      !latestMessage?.content
    ) {

      return
    }

    let mounted = true

    const execute = async () => {

      try {

        setLoading(true)

        setError(null)

        // ===============================
        // OpenAI Runtime
        // ===============================

        const result =

          await OpenAIAdapter
            .chat({

              message:
                latestMessage.content,

              semanticIntent,

              messages,

            })

        if (
          !mounted
        ) {

          return
        }

        // ===============================
        // Assistant Message
        // ===============================

        const responseMessage = {

          id:
            crypto.randomUUID(),

          role:
            'assistant',

          content:

            result?.content
            || 'AI response unavailable.',

          created_at:
            new Date()
              .toISOString(),

        } satisfies
          ConversationMessage

        setAssistantMessage(
          responseMessage
        )

        // ===============================
        // Callback
        // ===============================

        onComplete?.(
          responseMessage
        )

      } catch (err: any) {

        console.error(
          '🔥 LLM Response Flow'
        )

        console.error(err)

        if (
          mounted
        ) {

          setError(

            err?.message
            || 'llm_response_error'

          )
        }

      } finally {

        if (
          mounted
        ) {

          setLoading(false)
        }
      }
    }

    execute()

    return () => {

      mounted = false
    }

  }, [

    latestMessage,
    semanticIntent,
    messages,
    onComplete,

  ])

  // ======================================
  // Error
  // ======================================

  if (
    error
  ) {

    return (

      <ConciergeError
        message={error}
      />

    )
  }

  // ======================================
  // Loading
  // ======================================

  if (
    loading
  ) {

    return (
      <TypingIndicator />
    )
  }

  // ======================================
  // Empty
  // ======================================

  if (
    !assistantMessage
  ) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <ChatMessage

      message={
        assistantMessage
      }

    />

  )
}