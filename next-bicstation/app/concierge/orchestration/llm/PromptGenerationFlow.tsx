// /app/concierge/orchestration/llm/PromptGenerationFlow.tsx

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

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 PROMPTS
========================================= */

import systemPrompt
  from '../prompts/systemPrompt'

import semanticPrompt
  from '../prompts/semanticPrompt'

import recommendationPrompt
  from '../prompts/recommendationPrompt'

/* =========================================
🔥 FORMATTER
========================================= */

import {
  formatSemanticSummary,
} from '../lib/formatter/formatter'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  semanticIntent?:
    SemanticIntent

  onGenerated?: (
    prompt: string
  ) => void
}

/* =========================================
🔥 Prompt Generation Flow
========================================= */

export default function
PromptGenerationFlow({
  messages = [],
  semanticIntent,
  onGenerated,
}: Props) {

  // ======================================
  // Latest Message
  // ======================================

  const latestMessage =

    useMemo(() => (

      messages?.slice(-1)?.[0]

    ), [messages])

  // ======================================
  // Semantic Summary
  // ======================================

  const semanticSummary =

    useMemo(() => (

      formatSemanticSummary(
        semanticIntent
      )

    ), [semanticIntent])

  // ======================================
  // Prompt Runtime
  // ======================================

  const prompt =

    useMemo(() => {

      const blocks = [

        // ===============================
        // System
        // ===============================

        systemPrompt,

        // ===============================
        // Semantic
        // ===============================

        semanticPrompt({

          semanticIntent,

          summary:
            semanticSummary,

        }),

        // ===============================
        // Recommendation
        // ===============================

        recommendationPrompt({

          semanticIntent,

        }),

        // ===============================
        // Conversation
        // ===============================

        `USER_MESSAGE:
${latestMessage?.content || ''}`,

      ]

      return blocks
        .filter(Boolean)
        .join('\n\n')

    }, [

      semanticIntent,
      semanticSummary,
      latestMessage,

    ])

  // ======================================
  // Callback
  // ======================================

  useMemo(() => {

    if (
      prompt
      &&
      onGenerated
    ) {

      onGenerated(
        prompt
      )
    }

  }, [

    prompt,
    onGenerated,

  ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Prompt Generation Flow'
  )

  console.log({

    semanticSummary,

    promptLength:
      prompt.length,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <div
      style={{

        display:
          'none',

      }}
    >

      {prompt}

    </div>

  )
}