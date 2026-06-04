// /app/concierge/semantic/reasoning/buildRecommendationReasoning.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Build Recommendation Reasoning
========================================= */

export function buildRecommendationReasoning({
  semanticIntent,
  recommendations = [],
}: {
  semanticIntent?: SemanticIntent
  recommendations?: RecommendationPayload[]
}): string {

  const usage = semanticIntent?.usage || '不明'
  const gpu = semanticIntent?.gpu || '不明'

  const recommendationNames = recommendations.map(r => r.name).join(', ') || '該当なし'

  return `Recommendation Reasoning:
  Primary Usage: ${usage}
  GPU: ${gpu}
  Recommendations: ${recommendationNames}`
}