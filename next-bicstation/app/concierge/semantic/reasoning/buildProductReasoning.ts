// /app/concierge/semantic/reasoning/buildProductReasoning.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Build Product Reasoning
========================================= */

export function buildProductReasoning({
  semanticIntent,
  recommendations = [],
}: {
  semanticIntent?: SemanticIntent
  recommendations?: RecommendationPayload[]
}): string {

  const usage = semanticIntent?.usage || '不明'
  const gpu = semanticIntent?.gpu || '不明'

  const topRecommendation = recommendations[0]

  const topName = topRecommendation?.name || '該当なし'

  return `Product Recommendation Reasoning:
  Primary Usage: ${usage}
  GPU: ${gpu}
  Top Recommendation: ${topName}`
}