// /app/concierge/orchestration/llm/IntentInferenceFlow.tsx

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

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '@/app/concierge/domain/semantic/semanticDomain'

/* =========================================
🔥 FORMATTER
========================================= */

import {
  formatSemanticSummary,
} from '@/app/concierge/lib/formatter/formatter'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  onResolved?: (
    semanticIntent:
      SemanticIntent
  ) => void
}

/* =========================================
🔥 Intent Inference Flow
========================================= */

export default function
IntentInferenceFlow({
  messages = [],
  onResolved,
}: Props) {

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
  // Semantic Summary
  // ======================================

  const summary =

    useMemo(() => (

      formatSemanticSummary(
        semanticIntent
      )

    ), [semanticIntent])

  // ======================================
  // Callback
  // ======================================

  useMemo(() => {

    if (
      semanticIntent
      &&
      onResolved
    ) {

      onResolved(
        semanticIntent
      )
    }

  }, [

    semanticIntent,
    onResolved,

  ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Intent Inference Flow'
  )

  console.log({

    semanticIntent,

    summary,

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

      {summary}

    </div>

  )
}