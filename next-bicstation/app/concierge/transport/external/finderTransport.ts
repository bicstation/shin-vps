// /app/concierge/transport/external/finderTransport.ts

/* =========================================
🔥 EXTERNAL FINDER TRANSPORT
========================================= */

import type { SemanticFinderQuery } from '@/app/concierge/contracts/semantic/SemanticFinderQuery'
import type { RecommendationPayload } from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Fetch Finder External
========================================= */

export async function fetchFinderExternal(
  query: SemanticFinderQuery
): Promise<RecommendationPayload[]> {

  console.log('Fetching external finder results for query:', query)

  // TODO: Integrate real API endpoint
  return [
    {
      id: 'ext-001',
      name: 'External Recommended PC',
      description: 'High performance external recommendation',
      image_url: '/no-image.png',
      score: 90,
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