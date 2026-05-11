// /app/concierge/semantic/routing/buildFinderQuery.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
} from '@/app/concierge/contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Build Finder Query
========================================= */

export function buildFinderQuery(
  intent?: Partial<SemanticFinderQuery>
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