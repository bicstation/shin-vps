// /app/concierge/semantic/extraction/extractBudgetIntent.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
  SemanticIntent,
} from '../../contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Extract Budget Intent
========================================= */

export function extractBudgetIntent(
  query?: SemanticFinderQuery
): SemanticIntent {

  const budgetValue =
    query?.budget || 0

  return {
    usage: query?.usage,
    gpu: query?.gpu,
    cpu: query?.cpu,
    maker: query?.maker,
    memory: query?.memory,
    storage: query?.storage,
    resolution: query?.resolution,
    panel: query?.panel,
    workload: query?.workload,
    ai: query?.ai,
    budget: budgetValue,
  }
}