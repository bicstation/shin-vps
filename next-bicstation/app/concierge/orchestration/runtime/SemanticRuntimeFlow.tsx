// /app/concierge/orchestration/runtime/SemanticRuntimeFlow.tsx

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
  RecommendationPayload,
} from '../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 KERNEL
========================================= */

import SemanticKernel
  from '../kernel/semantic/SemanticKernel'

/* =========================================
🔥 FLOWS
========================================= */

import SemanticCoordinator
  from '../orchestration/core/SemanticCoordinator'

import SemanticRecommendationFlow
  from '../orchestration/recommendation/SemanticRecommendationFlow'

import RoutingRuntimeFlow
  from '../orchestration/routing/RoutingRuntimeFlow'

import SemanticMemoryFlow
  from '../orchestration/memory/SemanticMemoryFlow'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  recommendations?:
    RecommendationPayload[]

  autoNavigate?: boolean
}

/* =========================================
🔥 Semantic Runtime Flow
========================================= */

export default function
SemanticRuntimeFlow({
  messages = [],
  recommendations = [],
  autoNavigate = false,
}: Props) {

  // ======================================
  // Semantic Runtime
  // ======================================

  const runtime =

    useMemo(() => (

      SemanticKernel.execute({

        messages,

      })

    ), [messages])

  // ======================================
  // Runtime Values
  // ======================================

  const semanticIntent =

    runtime?.semanticIntent

  const summary =
    runtime?.summary

  const metrics =
    runtime?.metrics

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Runtime Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    summary,

    metrics,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      Semantic Coordinator
      ================================== */}

      <SemanticCoordinator

        messages={
          messages
        }

      />

      {/* ==================================
      Recommendation Runtime
      ================================== */}

      <SemanticRecommendationFlow

        semanticIntent={
          semanticIntent
        }

        recommendations={
          recommendations
        }

      />

      {/* ==================================
      Routing Runtime
      ================================== */}

      <RoutingRuntimeFlow

        semanticIntent={
          semanticIntent
        }

        recommendations={
          recommendations
        }

        autoNavigate={
          autoNavigate
        }

      />

      {/* ==================================
      Semantic Memory
      ================================== */}

      <SemanticMemoryFlow

        semanticIntent={
          semanticIntent
        }

      />

    </>

  )
}