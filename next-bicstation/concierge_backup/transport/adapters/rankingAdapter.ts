// /app/concierge/transport/adapters/rankingAdapter.ts

/* =========================================
🔥 RANKING ADAPTER
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Fetch Ranking Products
========================================= */

export async function fetchRankingProducts(
  slug: string
): Promise<RecommendationPayload[]> {

  console.log('Fetching ranking products for slug:', slug)

  // TODO: Replace with real backend API call
  return [
    {
      id: 'rank-001',
      name: 'Top Gaming PC',
      description: 'High performance gaming PC',
      image_url: '/no-image.png',
      score: 95,
      usage: slug.includes('gaming') ? 'gaming' : undefined,
    },
    {
      id: 'rank-002',
      name: 'Secondary PC',
      description: 'Balanced PC build',
      image_url: '/no-image.png',
      score: 88,
      usage: slug.includes('gaming') ? 'gaming' : undefined,
    },
  ]
}