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
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 KERNEL
========================================= */

import SemanticKernel
  from '@/app/concierge/kernel/semantic/SemanticKernel'

/* =========================================
🔥 FLOWS
========================================= */

import SemanticCoordinator
  from '@/app/concierge/orchestration/core/SemanticCoordinator'

import SemanticRecommendationFlow
  from '@/app/concierge/orchestration/recommendation/SemanticRecommendationFlow'

import RoutingRuntimeFlow
  from '@/app/concierge/orchestration/routing/RoutingRuntimeFlow'

import SemanticMemoryFlow
  from '@/app/concierge/orchestration/memory/SemanticMemoryFlow'

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