// /home/maya/shin-vps/next-bicstation/app/concierge/contracts/recommendation/RecommendationState.ts
// /app/concierge/contracts/recommendation/RecommendationState.ts

/* =========================================
🔥 Recommendation State Contract
========================================= */

import type { ProductRecommendation } from './ProductRecommendation'

export type RecommendationState = {
  sessionId: string

  recommendations: ProductRecommendation[]

  loading: boolean

  selectedRecommendationId?: string

  semanticContext?: Record<string, any>

  lastUpdated?: string
}