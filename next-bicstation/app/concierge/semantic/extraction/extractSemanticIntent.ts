// /app/concierge/semantic/extraction/extractSemanticIntent.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Extract Semantic Intent
========================================= */

export function extractSemanticIntent(
  query?: SemanticFinderQuery
): SemanticIntent {

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
    budget: query?.budget,
  }
}