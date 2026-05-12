// /app/concierge/transport/external/productTransport.ts

/* =========================================
🔥 EXTERNAL PRODUCT TRANSPORT
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Fetch External Product
========================================= */

export async function fetchProductExternal(
  unique_id: string
): Promise<RecommendationPayload | null> {

  console.log('Fetching external product detail for:', unique_id)

  // TODO: integrate with real external product API
  return {
    id: unique_id,
    name: 'External Dummy Product ' + unique_id,
    description: 'External product placeholder',
    image_url: '/no-image.png',
    score: 85,
  }
}