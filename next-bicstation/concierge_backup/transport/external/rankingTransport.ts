// /app/concierge/transport/external/rankingTransport.ts

/* =========================================
🔥 EXTERNAL RANKING TRANSPORT
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Fetch External Ranking
========================================= */

export async function fetchRankingExternal(
  slug: string
): Promise<RecommendationPayload[]> {

  console.log('Fetching external ranking for slug:', slug)

  // TODO: Replace with actual external ranking API
  return [
    {
      id: 'ext-rank-001',
      name: 'External Top PC',
      description: 'External high-performance PC',
      image_url: '/no-image.png',
      score: 92,
      usage: slug.includes('gaming') ? 'gaming' : undefined,
    },
    {
      id: 'ext-rank-002',
      name: 'External Secondary PC',
      description: 'Balanced external recommendation',
      image_url: '/no-image.png',
      score: 87,
      usage: slug.includes('gaming') ? 'gaming' : undefined,
    },
  ]
}