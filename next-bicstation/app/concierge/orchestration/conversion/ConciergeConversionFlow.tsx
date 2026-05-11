// /app/concierge/orchestration/conversion/ConciergeConversionFlow.tsx

// /app/concierge/orchestration/conversion/ConciergeConversionFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 FLOWS
========================================= */

import CommerceConversionFlow
  from './CommerceConversionFlow'

/* =========================================
🔥 Props
========================================= */

type Props = {

  recommendations?: RecommendationPayload[]

  semanticIntent?: SemanticIntent
}

/* =========================================
🔥 Concierge Conversion Flow
========================================= */

export default function
ConciergeConversionFlow({
  recommendations = [],
  semanticIntent,
}: Props) {

  // ======================================
  // Safe Recommendations
  // ======================================

  const safeRecommendations =

    useMemo(() => (

      Array.isArray(
        recommendations
      )
        ? recommendations
        : []

    ), [recommendations])

  // ======================================
  // Semantic Conversion
  // ======================================

  const conversionRecommendations =

    useMemo(() => {

      return safeRecommendations.map(
        item => ({

          ...item,

          score:

            item?.score
            || Math.floor(
              Math.random() * 30
            ) + 70,

        })
      )

    }, [safeRecommendations])

  // ======================================
  // Conversion Stats
  // ======================================

  const conversionStats =

    useMemo(() => {

      const total =

        conversionRecommendations
          .length

      const topScore =

        conversionRecommendations
          ?.[0]
          ?.score || 0

      return {

        total,

        topScore,

      }

    }, [conversionRecommendations])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Concierge Conversion Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    total:
      conversionStats.total,

    topScore:
      conversionStats.topScore,

  })

  // ======================================
  // Empty
  // ======================================

  if (
    !conversionRecommendations
      ?.length
  ) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <CommerceConversionFlow

      recommendations={
        conversionRecommendations
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}