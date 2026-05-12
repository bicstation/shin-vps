// /app/concierge/semantic/query/buildFinderQuery.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
} from '../../contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Build Finder Query
========================================= */

export function buildFinderQuery(params?: Partial<SemanticFinderQuery>): SemanticFinderQuery {

  return {
    usage: params?.usage,
    gpu: params?.gpu,
    cpu: params?.cpu,
    maker: params?.maker,
    memory: params?.memory,
    storage: params?.storage,
    resolution: params?.resolution,
    panel: params?.panel,
    workload: params?.workload,
    ai: params?.ai,
    budget: params?.budget,
  }
}