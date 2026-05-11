// /app/concierge/semantic/recommendation/calculateSemanticScore.ts

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
🔥 Calculate Semantic Score
========================================= */

export function calculateSemanticScore({
  semanticIntent,
  recommendation,
}: {
  semanticIntent?: SemanticIntent
  recommendation: RecommendationPayload
}): number {

  let score = 0

  if (!semanticIntent) return score

  // ======================================
  // Basic semantic matching
  // ======================================

  const attributes: (keyof SemanticIntent)[] = [
    'usage', 'gpu', 'cpu', 'maker', 'memory', 'storage', 'resolution', 'panel', 'workload', 'ai'
  ]

  attributes.forEach(attr => {
    if (
      semanticIntent[attr] &&
      semanticIntent[attr] === recommendation[attr]
    ) {
      score += 10
    }
  })

  // ======================================
  // Budget scoring
  // ======================================

  if (
    semanticIntent.budget &&
    typeof semanticIntent.budget === 'number' &&
    recommendation.budget &&
    typeof recommendation.budget === 'number'
  ) {
    const diff = Math.abs(semanticIntent.budget - recommendation.budget)
    score += Math.max(0, 20 - diff / 10000)
  }

  return Math.min(score, 100)
}