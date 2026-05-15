// /app/concierge/contracts/semantic/SemanticScore.ts

/* =========================================
🔥 Semantic Score Contract
========================================= */

export type SemanticScore = {
  semanticId: string
  score: number
  weight?: number
  confidence?: number
  computedAt: string
}