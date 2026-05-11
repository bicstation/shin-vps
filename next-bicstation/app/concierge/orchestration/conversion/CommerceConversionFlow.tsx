// /app/concierge/orchestration/conversion/CommerceConversionFlow.tsx
// /app/concierge/orchestration/conversion/CommerceConversionFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 SECTIONS
========================================= */

import RecommendationSection
  from '../sections/recommendation/RecommendationSection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  recommendations?: RecommendationPayload[]

  semanticIntent?: SemanticIntent
}

/* =========================================
🔥 Commerce Conversion Flow
========================================= */

export default function
CommerceConversionFlow({
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
  // Sorted Recommendations
  // ======================================

  const sortedRecommendations =

    useMemo(() => (

      [...safeRecommendations].sort(
        (a, b) => (

          (b?.score || 0)
          -
          (a?.score || 0)

        )
      )

    ), [safeRecommendations])

  // ======================================
  // Top Recommendation
  // ======================================

  const topRecommendation =

    useMemo(() => (

      sortedRecommendations?.[0]

    ), [sortedRecommendations])

  // ======================================
  // Commerce Metrics
  // ======================================

  const commerceMetrics =

    useMemo(() => {

      const total =
        sortedRecommendations.length

      const averageScore =

        total > 0

          ? Math.round(

              sortedRecommendations.reduce(
                (
                  acc,
                  item,
                ) => (

                  acc
                  +
                  (
                    item?.score
                    || 0
                  )

                ),
                0
              ) / total

            )

          : 0

      return {

        total,

        averageScore,

      }

    }, [sortedRecommendations])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Commerce Conversion Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    totalRecommendations:
      commerceMetrics.total,

    averageScore:
      commerceMetrics.averageScore,

    topRecommendation:

      topRecommendation?.name
      || null,

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

    <RecommendationSection

      recommendations={
        sortedRecommendations
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}