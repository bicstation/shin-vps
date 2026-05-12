// /app/concierge/transport/ranking/rankingTransport.ts

/* =========================================
🔥 RANKING TRANSPORT
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

import { fetchRankingTransport } from './fetchRankingTransport'

/* =========================================
🔥 Ranking Transport
========================================= */

export async function rankingTransport(
  slug: string
): Promise<RecommendationPayload[]> {

  console.log('Ranking transport called for slug:', slug)

  const results = await fetchRankingTransport(slug)

  return results
}