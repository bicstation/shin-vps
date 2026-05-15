// /app/concierge/orchestration/agent/RecommendationAgentFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 TYPES
========================================= */

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 AGENTS
========================================= */

import RecommendationAgent
  from '../../agents/recommendation/RecommendationAgent'

import GamingAgent
  from '../../agents/specialists/GamingAgent'

import CreatorAgent
  from '../../agents/specialists/CreatorAgent'

import BusinessAgent
  from '../../agents/specialists/BusinessAgent'

import AIAgent
  from '../../agents/specialists/AIAgent'

/* =========================================
🔥 SEMANTIC
========================================= */

import {
  resolveSemanticIntent,
} from '../../semantic/intent/resolveSemanticIntent'

/* =========================================
🔥 SECTION
========================================= */

import RecommendationSection
  from '../../sections/recommendation/RecommendationSection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: any[]

  recommendations?: any[]
}

/* =========================================
🔥 Recommendation Agent Flow
========================================= */

export default function
RecommendationAgentFlow({
  messages = [],
  recommendations = [],
}: Props) {

  // ======================================
  // Semantic Intent
  // ======================================

  const semanticIntent =

    useMemo(() => (

      resolveSemanticIntent(
        messages
      )

    ), [messages])

  // ======================================
  // Specialist Agent
  // ======================================

  const specialistAgent =

    useMemo(() => {

      switch (
        semanticIntent?.usage
      ) {

        case 'gaming':
          return GamingAgent

        case 'creator':
          return CreatorAgent

        case 'business':
          return BusinessAgent

        case 'ai':
          return AIAgent

        default:
          return RecommendationAgent
      }

    }, [semanticIntent])

  // ======================================
  // Recommendation Runtime
  // ======================================

  const runtimeRecommendations =

    useMemo<
      RecommendationPayload[]
    >(() => {

      if (
        typeof specialistAgent
          ?.execute
        !== 'function'
      ) {

        return recommendations
      }

      try {

        return specialistAgent.execute({

          intent:
            semanticIntent,

          recommendations,

          messages,

        })

      } catch (error) {

        console.error(
          '🔥 Recommendation Agent Error'
        )

        console.error(error)

        return recommendations
      }

    }, [

      specialistAgent,
      semanticIntent,
      recommendations,
      messages,

    ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Agent Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    specialist:

      specialistAgent?.name
      || 'RecommendationAgent',

    recommendationCount:
      runtimeRecommendations
        ?.length || 0,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <RecommendationSection

      recommendations={
        runtimeRecommendations
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}