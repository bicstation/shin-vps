// /app/concierge/semantic/recommendation/buildSemanticRecommendation.ts

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
🔥 Build Semantic Recommendation
========================================= */

export function buildSemanticRecommendation({
  semanticIntent,
  recommendations = [],
}: {
  semanticIntent?: SemanticIntent
  recommendations?: RecommendationPayload[]
}): RecommendationPayload[] {

  return recommendations.map(r => ({
    ...r,
    usage: semanticIntent?.usage || r.usage,
    gpu: semanticIntent?.gpu || r.gpu,
    cpu: semanticIntent?.cpu || r.cpu,
    maker: semanticIntent?.maker || r.maker,
    memory: semanticIntent?.memory || r.memory,
    storage: semanticIntent?.storage || r.storage,
    resolution: semanticIntent?.resolution || r.resolution,
    panel: semanticIntent?.panel || r.panel,
    workload: semanticIntent?.workload || r.workload,
    ai: semanticIntent?.ai || r.ai,
    budget: semanticIntent?.budget || r.budget,
  }))
}