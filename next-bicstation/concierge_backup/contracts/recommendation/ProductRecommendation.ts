// /app/concierge/contracts/recommendation/ProductRecommendation.ts

/* =========================================
🔥 Product Recommendation Contract
========================================= */

export type ProductRecommendation = {
  unique_id: string
  name: string
  maker?: string
  price?: number
  image_url?: string
  shortTitle?: string
  description?: string
  grouped_attributes?: Record<string, any>
  semantic_score?: number
  confidence?: number
  recommendation_reason?: string
}