// /app/concierge/semantic/recommendation/calculateRecommendationScore.ts

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
🔥 Calculate Recommendation Score
========================================= */

export function calculateRecommendationScore({
  semanticIntent,
  recommendation,
}: {
  semanticIntent?: SemanticIntent
  recommendation: RecommendationPayload
}): number {

  let score = 0

  if (!semanticIntent) return score

  // ======================================
  // Semantic matching
  // ======================================

  if (
    semanticIntent.usage &&
    semanticIntent.usage === recommendation.usage
  ) score += 20

  if (
    semanticIntent.gpu &&
    semanticIntent.gpu === recommendation.gpu
  ) score += 20

  if (
    semanticIntent.cpu &&
    semanticIntent.cpu === recommendation.cpu
  ) score += 10

  if (
    semanticIntent.maker &&
    semanticIntent.maker === recommendation.maker
  ) score += 10

  if (
    semanticIntent.memory &&
    semanticIntent.memory === recommendation.memory
  ) score += 10

  if (
    semanticIntent.budget &&
    typeof semanticIntent.budget === 'number' &&
    recommendation.budget &&
    typeof recommendation.budget === 'number'
  ) {
    const diff = Math.abs(
      semanticIntent.budget - recommendation.budget
    )
    score += Math.max(0, 20 - diff / 10000)
  }

  return Math.min(score, 100)
}