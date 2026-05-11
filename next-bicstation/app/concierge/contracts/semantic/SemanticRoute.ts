// /app/concierge/contracts/semantic/SemanticRoute.ts

/* =========================================
🔥 Semantic Route Contract
========================================= */

export type SemanticRoute = {
  slug: string
  destination: string
  type: 'ranking' | 'finder' | 'product'
  parameters?: Record<string, any>
}