// /app/concierge/transport/adapters/productAdapter.ts

/* =========================================
🔥 PRODUCT ADAPTER
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Fetch Product Detail
========================================= */

export async function fetchProductDetail(
  unique_id: string
): Promise<RecommendationPayload | null> {

  console.log('Fetching product detail for:', unique_id)

  // TODO: Replace with real API integration
  return {
    id: unique_id,
    name: 'Dummy Product ' + unique_id,
    description: 'Description for ' + unique_id,
    image_url: '/no-image.png',
    score: 80,
  }
}