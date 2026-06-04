// /app/concierge/domain/recommendation/recommendationDomain.ts
// /app/concierge/domain/recommendation/recommendationDomain.ts

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
🔥 Recommendation Domain
========================================= */

export const RecommendationDomain = {

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
  Resolve Recommendation Score
  ===================================== */

  calculateRecommendationScore({
    recommendation,
    semanticIntent,
  }: {
    recommendation:
      RecommendationPayload

    semanticIntent?:
      SemanticIntent
  }) {

    let score =

      recommendation?.score
      || 70

    // ===================================
    // Usage Bonus
    // ===================================

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

        score += 6
        break

      case 'ai':

        score += 12
        break

      default:

        score += 0
    }

    // ===================================
    // Price Optimization
    // ===================================

    if (
      semanticIntent?.budget
      &&
      recommendation?.price
    ) {

      const delta =

        semanticIntent.budget
        -
        recommendation.price

      if (
        delta >= 0
      ) {

        score += 5
      }
    }

    return Math.min(
      100,
      score
    )
  },

  /* =====================================
  Apply Recommendation Scoring
  ===================================== */

  applyRecommendationScoring({
    recommendations,
    semanticIntent,
  }: {
    recommendations:
      RecommendationPayload[]

    semanticIntent?:
      SemanticIntent
  }) {

    return recommendations.map(
      item => ({

        ...item,

        score:

          this.calculateRecommendationScore({

            recommendation:
              item,

            semanticIntent,

          }),

      })
    )
  },

  /* =====================================
  Sort Recommendations
  ===================================== */

  sortRecommendations(
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

    return this.sortRecommendations(
      recommendations
    )?.[0]
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
          '高性能GPUとゲーム向け冷却性能を重視した構成です。'
        )

      case 'creator':

        return (
          '動画編集・制作ワークロード向けに最適化されています。'
        )

      case 'business':

        return (
          '安定性と業務効率を重視したビジネス向け構成です。'
        )

      case 'ai':

        return (
          'AI生成・LLM・GPU推論向けに最適化された構成です。'
        )

      default:

        return (
          recommendation?.reasoning
          || 'semantic recommendation'
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
  Build Recommendation Payload
  ===================================== */

  buildRecommendationPayload({
    recommendation,
    semanticIntent,
  }: {
    recommendation:
      RecommendationPayload

    semanticIntent?:
      SemanticIntent
  }): RecommendationPayload {

    return {

      ...recommendation,

      score:

        this.calculateRecommendationScore({

          recommendation,

          semanticIntent,

        }),

      reasoning:

        this.buildRecommendationReasoning({

          recommendation,

          semanticIntent,

        }),

    }
  },

  /* =====================================
  Build Recommendation Runtime
  ===================================== */

  buildRecommendationRuntime({
    recommendations,
    semanticIntent,
  }: {
    recommendations:
      RecommendationPayload[]

    semanticIntent?:
      SemanticIntent
  }) {

    const filtered =

      this.filterByBudget({

        recommendations,

        maxPrice:
          semanticIntent?.budget,

      })

    const scored =

      this.applyRecommendationScoring({

        recommendations:
          filtered,

        semanticIntent,

      })

    return this.sortRecommendations(
      scored
    )
  },
}

export default RecommendationDomain