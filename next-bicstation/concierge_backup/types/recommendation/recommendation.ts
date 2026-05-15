// /app/concierge/types/recommendation/recommendation.ts

/* =========================================
🔥 RECOMMENDATION TYPES
========================================= */

import type { RecommendationPayload } from './product'

export type RecommendationResult = {
  recommendations: RecommendationPayload[]
  reasoning?: string
  confidence?: number
}