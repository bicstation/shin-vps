// /app/concierge/semantic/query/buildSemanticQuery.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
  SemanticIntent,
} from '../../contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Build Semantic Query
========================================= */

export function buildSemanticQuery(
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