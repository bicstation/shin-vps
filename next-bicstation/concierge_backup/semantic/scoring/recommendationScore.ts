// /app/concierge/semantic/scoring/recommendationScore.ts

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
🔥 Recommendation Score
========================================= */

export function recommendationScore({
  semanticIntent,
  recommendation,
}: {
  semanticIntent?: SemanticIntent
  recommendation: RecommendationPayload
}): number {

  let score = 0

  if (!semanticIntent) return score

  // ======================================
  // Usage & GPU
  // ======================================

  if (semanticIntent.usage === recommendation.usage) score += 20
  if (semanticIntent.gpu === recommendation.gpu) score += 20

  // ======================================
  // CPU & Maker
  // ======================================

  if (semanticIntent.cpu === recommendation.cpu) score += 10
  if (semanticIntent.maker === recommendation.maker) score += 10

  // ======================================
  // Memory & Budget
  // ======================================

  if (semanticIntent.memory === recommendation.memory) score += 10

  if (
    semanticIntent.budget &&
    recommendation.budget
  ) {
    const diff = Math.abs(
      semanticIntent.budget - recommendation.budget
    )
    score += Math.max(0, 20 - diff / 10000)
  }

  return Math.min(score, 100)
}