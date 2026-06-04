// /app/concierge/semantic/query/buildRecommendationQuery.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
  SemanticFinderQuery,
} from '../../contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Build Recommendation Query
========================================= */

export function buildRecommendationQuery(
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