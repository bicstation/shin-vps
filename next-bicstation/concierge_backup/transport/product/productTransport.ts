// /app/concierge/transport/product/productTransport.ts

/* =========================================
🔥 PRODUCT TRANSPORT
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

import { fetchProductTransport } from './fetchProductTransport'

/* =========================================
🔥 Product Transport
========================================= */

export async function productTransport(
  unique_id: string
): Promise<RecommendationPayload | null> {

  console.log('Product transport called for unique_id:', unique_id)

  const product = await fetchProductTransport(unique_id)

  return product
}