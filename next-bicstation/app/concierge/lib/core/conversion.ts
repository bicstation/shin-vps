// /app/concierge/lib/core/conversion.ts

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
🔥 Format Price
========================================= */

export function
formatPrice(
  price?: number
): string {

  if (
    !price
  ) {

    return '¥0'
  }

  return `¥${price.toLocaleString()}`
}

/* =========================================
🔥 Normalize Budget
========================================= */

export function
normalizeBudget(
  value?: string | number
): number | undefined {

  // ======================================
  // Number
  // ======================================

  if (
    typeof value
    === 'number'
  ) {

    return value
  }

  // ======================================
  // Invalid
  // ======================================

  if (
    typeof value
    !== 'string'
  ) {

    return undefined
  }

  const normalized =

    value
      .replace(/,/g, '')
      .replace(/円/g, '')
      .trim()

  // ======================================
  // 30万
  // ======================================

  const manMatch =

    normalized.match(
      /([0-9]+)\s?万/
    )

  if (
    manMatch?.[1]
  ) {

    return (
      Number(manMatch[1])
      * 10000
    )
  }

  // ======================================
  // Raw Number
  // ======================================

  const numberValue =

    Number(normalized)

  if (
    Number.isNaN(
      numberValue
    )
  ) {

    return undefined
  }

  return numberValue
}

/* =========================================
🔥 Calculate Conversion Score
========================================= */

export function
calculateConversionScore({
  recommendation,
  semanticIntent,
}: {
  recommendation:
    RecommendationPayload

  semanticIntent?:
    SemanticIntent
}): number {

  let score =

    recommendation?.score
    || 70

  // ======================================
  // Usage Bonus
  // ======================================

  switch (
    semanticIntent?.usage
  ) {

    case 'gaming':

      score += 10
      break

    case 'creator':

      score += 8
      break

    case 'business':

      score += 5
      break

    case 'ai':

      score += 12
      break

    default:

      score += 0
  }

  // ======================================
  // Budget Match Bonus
  // ======================================

  if (
    semanticIntent?.budget
    &&
    recommendation?.price
  ) {

    const difference = Math.abs(

      semanticIntent.budget
      -
      recommendation.price

    )

    if (
      difference <= 50000
    ) {

      score += 6
    }
  }

  return Math.min(
    100,
    score
  )
}

/* =========================================
🔥 Apply Conversion Scoring
========================================= */

export function
applyConversionScoring({
  recommendations,
  semanticIntent,
}: {
  recommendations:
    RecommendationPayload[]

  semanticIntent?:
    SemanticIntent
}): RecommendationPayload[] {

  return recommendations.map(
    item => ({

      ...item,

      score:

        calculateConversionScore({

          recommendation:
            item,

          semanticIntent,

        }),

    })
  )
}

/* =========================================
🔥 Sort Recommendations
========================================= */

export function
sortRecommendations(
  recommendations:
    RecommendationPayload[] = []
): RecommendationPayload[] {

  return [...recommendations]
    .sort(
      (a, b) => (

        (b?.score || 0)
        -
        (a?.score || 0)

      )
    )
}

/* =========================================
🔥 Build Conversion Runtime
========================================= */

export function
buildConversionRuntime({
  recommendations,
  semanticIntent,
}: {
  recommendations:
    RecommendationPayload[]

  semanticIntent?:
    SemanticIntent
}): RecommendationPayload[] {

  const scored =

    applyConversionScoring({

      recommendations,

      semanticIntent,

    })

  return sortRecommendations(
    scored
  )
}

/* =========================================
🔥 Build Recommendation Reasoning
========================================= */

export function
buildRecommendationReasoning({
  semanticIntent,
}: {
  semanticIntent?:
    SemanticIntent
}): string {

  switch (
    semanticIntent?.usage
  ) {

    case 'gaming':

      return (
        '高fpsゲーム向けGPU性能を重視した構成です。'
      )

    case 'creator':

      return (
        '動画編集・制作ワークロード向けに最適化されています。'
      )

    case 'business':

      return (
        '業務用途向けの安定性とコスト効率を重視しています。'
      )

    case 'ai':

      return (
        'AI生成・LLM・GPU推論向け性能を重視しています。'
      )

    default:

      return (
        'semantic recommendation runtime'
      )
  }
}