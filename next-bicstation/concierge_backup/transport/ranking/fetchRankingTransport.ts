// /app/concierge/transport/ranking/fetchRankingTransport.ts

/* =========================================
🔥 FETCH RANKING TRANSPORT
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

import { fetchRankingProducts } from '../adapters/rankingAdapter'

/* =========================================
🔥 Fetch Ranking Transport
========================================= */

export async function fetchRankingTransport(
  slug: string
): Promise<RecommendationPayload[]> {

  console.log('Fetching ranking transport for slug:', slug)

  const results = await fetchRankingProducts(slug)

  return results
}