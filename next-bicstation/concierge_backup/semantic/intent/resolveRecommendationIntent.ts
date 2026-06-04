// /app/concierge/semantic/intent/resolveRecommendationIntent.ts

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
🔥 Resolve Recommendation Intent
========================================= */

export function resolveRecommendationIntent(
  recommendations: RecommendationPayload[]
): SemanticIntent {

  if (!recommendations.length) {
    return {}
  }

  const first = recommendations[0]

  return {
    usage: first?.usage,
    gpu: first?.gpu,
    cpu: first?.cpu,
    maker: first?.maker,
    memory: first?.memory,
    storage: first?.storage,
    resolution: first?.resolution,
    panel: first?.panel,
    workload: first?.workload,
    ai: first?.ai,
    budget: first?.budget,
  }
}