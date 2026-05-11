// /app/concierge/semantic/recommendation/buildRecommendation.ts

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
🔥 Build Recommendation
========================================= */

export function buildRecommendation({
  semanticIntent,
  product,
}: {
  semanticIntent?: SemanticIntent
  product?: RecommendationPayload
}): RecommendationPayload {

  return {
    id: product?.id || 'unknown',
    name: product?.name || 'おすすめPC',
    description: product?.description || 'Semantic AI recommendation',
    image_url: product?.image_url || '/no-image.png',
    score: product?.score || 0,
    usage: semanticIntent?.usage,
    gpu: semanticIntent?.gpu,
    cpu: semanticIntent?.cpu,
    maker: semanticIntent?.maker,
    memory: semanticIntent?.memory,
    storage: semanticIntent?.storage,
    resolution: semanticIntent?.resolution,
    panel: semanticIntent?.panel,
    workload: semanticIntent?.workload,
    ai: semanticIntent?.ai,
    budget: semanticIntent?.budget,
  }
}