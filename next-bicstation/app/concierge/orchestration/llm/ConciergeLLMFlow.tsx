// /app/concierge/orchestration/llm/ConciergeLLMFlow.tsx

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
} from '../contracts/conversation/ConversationMessage'

/* =========================================
🔥 ADAPTERS
========================================= */

import OpenAIAdapter
  from '../adapters/openaiAdapter'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '../domain/semantic/semanticDomain'

/* =========================================
🔥 COMPONENTS
========================================= */

import ConciergeLoading
  from '../components/ConciergeLoading'

import ConciergeError
  from '../components/ConciergeError'

import ChatMessageList
  from '../components/ChatMessageList'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]
}

/* =========================================
🔥 Concierge LLM Flow
========================================= */

export default function
ConciergeLLMFlow({
  messages = [],
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
    response,
    setResponse,
  ] = useState<
    ConversationMessage | null
  >(null)

  // ======================================
  // Latest User Message
  // ======================================

  const latestMessage =

    useMemo(() => (

      messages.filter(
        item => (
          item?.role
          === 'user'
        )
      )?.slice(-1)?.[0]

    ), [messages])

  // ======================================
  // Semantic Intent
  // ======================================

  const semanticIntent =

    useMemo(() => (

      SemanticDomain
        .resolveSemanticIntent(
          messages
        )

    ), [messages])

  // ======================================
  // LLM Runtime
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
        // Adapter
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

        setResponse({

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

        })

      } catch (err: any) {

        console.error(
          '🔥 Concierge LLM Flow'
        )

        console.error(err)

        if (
          mounted
        ) {

          setError(

            err?.message
            || 'llm_runtime_error'

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
      <ConciergeLoading />
    )
  }

  // ======================================
  // Render Messages
  // ======================================

  return (

    <ChatMessageList

      messages={[

        ...messages,

        ...(response
          ? [response]
          : []),

      ]}

    />

  )
}