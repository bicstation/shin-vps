// /app/concierge/contracts/semantic/SemanticFinderQuery.ts

/* =========================================
🔥 Semantic Finder Query Contract
========================================= */

export type SemanticFinderQuery = {
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

  page?: number
  limit?: number

  sort?: string
  order?: 'asc' | 'desc'
}