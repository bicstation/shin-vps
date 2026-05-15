// /app/concierge/contracts/recommendation/RecommendationReasoning.ts

/* =========================================
🔥 Recommendation Reasoning Contract
========================================= */

export type RecommendationReasoning = {
  recommendationId: string
  reasoningSteps: {
    step: string
    explanation: string
    scoreImpact?: number
  }[]
  finalScore?: number
  confidence?: number
  generatedAt: string
}