// /app/concierge/transport/product/fetchProductTransport.ts

/* =========================================
🔥 FETCH PRODUCT TRANSPORT
========================================= */

import type { RecommendationPayload } from '@/app/concierge/contracts/recommendation/RecommendationPayload'

import { fetchProductDetail } from '../adapters/productAdapter'

/* =========================================
🔥 Fetch Product Transport
========================================= */

export async function fetchProductTransport(
  unique_id: string
): Promise<RecommendationPayload | null> {

  console.log('Fetching product transport for unique_id:', unique_id)

  const product = await fetchProductDetail(unique_id)

  return product
}