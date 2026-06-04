// /app/concierge/semantic/extraction/extractSemanticQuery.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
} from '../../contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Extract Semantic Query
========================================= */

export function extractSemanticQuery(
  query?: SemanticFinderQuery
): SemanticFinderQuery {

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