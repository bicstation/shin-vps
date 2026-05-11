// /app/concierge/semantic/intent/resolveSemanticIntent.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
} from '@/app/concierge/contracts/semantic/SemanticFinderQuery'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 Resolve Semantic Intent
========================================= */

export function resolveSemanticIntent(
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