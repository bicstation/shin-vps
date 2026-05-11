// /app/concierge/domain/commerce/commerceDomain.ts

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
🔥 Commerce Domain
========================================= */

export const CommerceDomain = {

  /* =====================================
  Normalize Recommendations
  ===================================== */

  normalizeRecommendations(
    recommendations:
      RecommendationPayload[] = []
  ) {

    return Array.isArray(
      recommendations
    )
      ? recommendations
      : []
  },

  /* =====================================
  Sort By Score
  ===================================== */

  sortByScore(
    recommendations:
      RecommendationPayload[] = []
  ) {

    return [...recommendations]
      .sort(
        (a, b) => (

          (b?.score || 0)
          -
          (a?.score || 0)

        )
      )
  },

  /* =====================================
  Resolve Top Recommendation
  ===================================== */

  getTopRecommendation(
    recommendations:
      RecommendationPayload[] = []
  ) {

    return this.sortByScore(
      recommendations
    )?.[0]
  },

  /* =====================================
  Calculate Average Score
  ===================================== */

  calculateAverageScore(
    recommendations:
      RecommendationPayload[] = []
  ) {

    if (
      !recommendations.length
    ) {

      return 0
    }

    const total =

      recommendations.reduce(
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
      )

    return Math.round(
      total
      /
      recommendations.length
    )
  },

  /* =====================================
  Apply Semantic Bonus
  ===================================== */

  applySemanticBonus({
    recommendations,
    semanticIntent,
  }: {
    recommendations:
      RecommendationPayload[]

    semanticIntent?:
      SemanticIntent
  }) {

    return recommendations.map(
      item => {

        let bonus = 0

        switch (
          semanticIntent?.usage
        ) {

          case 'gaming':
            bonus += 10
            break

          case 'creator':
            bonus += 8
            break

          case 'business':
            bonus += 6
            break

          case 'ai':
            bonus += 12
            break

          default:
            bonus += 0
        }

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
  },

  /* =====================================
  Build Recommendation Reasoning
  ===================================== */

  buildRecommendationReasoning({
    recommendation,
    semanticIntent,
  }: {
    recommendation:
      RecommendationPayload

    semanticIntent?:
      SemanticIntent
  }) {

    const usage =

      semanticIntent?.usage
      || 'general'

    switch (usage) {

      case 'gaming':

        return (
          '高性能GPUを搭載し、ゲーム用途に最適化された構成です。'
        )

      case 'creator':

        return (
          '動画編集・制作向けの高負荷ワークロードに適しています。'
        )

      case 'business':

        return (
          '業務用途に適した安定性とコストバランスを重視しています。'
        )

      case 'ai':

        return (
          'AI画像生成やLLM用途に適した高性能構成です。'
        )

      default:

        return (
          recommendation?.reasoning
          || 'semantic recommendation runtime'
        )
    }
  },

  /* =====================================
  Filter By Budget
  ===================================== */

  filterByBudget({
    recommendations,
    maxPrice,
  }: {
    recommendations:
      RecommendationPayload[]

    maxPrice?: number
  }) {

    if (
      !maxPrice
    ) {

      return recommendations
    }

    return recommendations.filter(
      item => (

        (item?.price || 0)
        <= maxPrice

      )
    )
  },

  /* =====================================
  Resolve Commerce Metrics
  ===================================== */

  buildCommerceMetrics(
    recommendations:
      RecommendationPayload[] = []
  ) {

    return {

      total:
        recommendations.length,

      averageScore:

        this.calculateAverageScore(
          recommendations
        ),

      topRecommendation:

        this.getTopRecommendation(
          recommendations
        ),

    }
  },
}

export default CommerceDomain