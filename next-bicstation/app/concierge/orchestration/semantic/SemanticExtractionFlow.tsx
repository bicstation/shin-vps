// /app/concierge/orchestration/semantic/SemanticExtractionFlow.tsx

'use client'

import {
  useEffect,
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
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '../domain/semantic/semanticDomain'

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

  onExtracted?: (
    semanticIntent:
      SemanticIntent
  ) => void
}

/* =========================================
🔥 Semantic Extraction Flow
========================================= */

export default function
SemanticExtractionFlow({
  messages = [],
  onExtracted,
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

  useEffect(() => {

    if (
      semanticIntent
      &&
      onExtracted
    ) {

      onExtracted(
        semanticIntent
      )
    }

  }, [

    semanticIntent,
    onExtracted,

  ])

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    usage:
      semanticIntent
        ?.usage || null,

    budget:
      semanticIntent
        ?.budget || null,

    gpu:
      semanticIntent
        ?.gpu || null,

    ai:
      semanticIntent
        ?.ai || false,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Extraction Flow'
  )

  console.log({

    summary,

    metrics,

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