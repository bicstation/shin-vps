// /app/concierge/transport/adapters/finderAdapter.ts

/* =========================================
🔥 FINDER ADAPTER
========================================= */

import type { SemanticFinderQuery } from '../../contracts/semantic/SemanticFinderQuery'
import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Fetch Finder Results (Mock / Real API)
========================================= */

export async function fetchFinderResult(
  query: SemanticFinderQuery
): Promise<RecommendationPayload[]> {

  // TODO: Replace with real API call to backend semantic finder
  console.log('Fetching finder results for query:', query)

  return [
    {
      id: 'dummy-001',
      name: 'RTX 4080 Gaming PC',
      description: '高性能ゲーミングPC',
      image_url: '/no-image.png',
      score: 95,
      usage: query.usage,
      gpu: query.gpu,
      cpu: query.cpu,
      maker: query.maker,
      memory: query.memory,
      storage: query.storage,
      resolution: query.resolution,
      panel: query.panel,
      workload: query.workload,
      ai: query.ai,
      budget: query.budget,
    },
  ]
}