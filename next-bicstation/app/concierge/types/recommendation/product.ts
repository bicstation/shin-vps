// /app/concierge/types/recommendation/product.ts

/* =========================================
🔥 RECOMMENDATION PRODUCT TYPES
========================================= */

export type RecommendationPayload = {
  id: string
  name: string
  description?: string
  image_url?: string
  score?: number
  usage?: string
  gpu?: string
  cpu?: string
  maker?: string
  memory?: string
  storage?: string
  resolution?: string
  panel?: string
  workload?: string
  ai?: string
  budget?: number
}