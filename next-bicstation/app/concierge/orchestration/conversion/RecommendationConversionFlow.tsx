// /app/concierge/orchestration/conversion/RecommendationConversionFlow.tsx

// /app/concierge/orchestration/conversion/RecommendationConversionFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

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
🔥 Recommendation Conversion Flow
========================================= */

export default function
RecommendationConversionFlow({
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
  // Semantic Scoring
  // ======================================

  const scoredRecommendations =

    useMemo(() => {

      return safeRecommendations.map(
        item => {

          let bonus = 0

          // ===============================
          // Usage Match
          // ===============================

          if (
            semanticIntent?.usage
            === 'gaming'
          ) {

            bonus += 10
          }

          if (
            semanticIntent?.usage
            === 'creator'
          ) {

            bonus += 8
          }

          if (
            semanticIntent?.usage
            === 'business'
          ) {

            bonus += 6
          }

          if (
            semanticIntent?.usage
            === 'ai'
          ) {

            bonus += 12
          }

          // ===============================
          // Base Score
          // ===============================

          const baseScore =

            item?.score
            || 70

          return {

            ...item,

            score:
              Math.min(
                100,
                baseScore + bonus
              ),

          }
        }
      )

    }, [

      safeRecommendations,
      semanticIntent,

    ])

  // ======================================
  // Sorted
  // ======================================

  const sortedRecommendations =

    useMemo(() => (

      [...scoredRecommendations]
        .sort(
          (a, b) => (

            (b?.score || 0)
            -
            (a?.score || 0)

          )
        )

    ), [scoredRecommendations])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Conversion Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    recommendationCount:
      sortedRecommendations
        ?.length || 0,

    bestScore:
      sortedRecommendations?.[0]
        ?.score || 0,

  })

  // ======================================
  // Empty
  // ======================================

  if (
    !sortedRecommendations
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
        sortedRecommendations
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}