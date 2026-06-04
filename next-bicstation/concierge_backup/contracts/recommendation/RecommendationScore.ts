// /app/concierge/contracts/recommendation/RecommendationScore.ts

/* =========================================
🔥 Recommendation Score Contract
========================================= */

export type RecommendationScore = {
  recommendationId: string
  semantic_score?: number
  price_similarity?: number
  gpu_match?: number
  usage_match?: number
  maker_match?: number
  spec_similarity?: number
  totalScore?: number
  confidence?: number
  computedAt: string
}