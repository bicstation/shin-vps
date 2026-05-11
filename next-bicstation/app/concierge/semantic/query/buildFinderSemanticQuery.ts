// /app/concierge/semantic/query/buildFinderSemanticQuery.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Build Finder Semantic Query
========================================= */

export function buildFinderSemanticQuery(
  intent?: SemanticIntent
): SemanticFinderQuery {

  return {
    usage: intent?.usage,
    gpu: intent?.gpu,
    cpu: intent?.cpu,
    maker: intent?.maker,
    memory: intent?.memory,
    storage: intent?.storage,
    resolution: intent?.resolution,
    panel: intent?.panel,
    workload: intent?.workload,
    ai: intent?.ai,
    budget: intent?.budget,
  }
}