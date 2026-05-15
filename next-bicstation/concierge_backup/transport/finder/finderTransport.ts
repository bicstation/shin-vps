// /app/concierge/transport/finder/finderTransport.ts

/* =========================================
🔥 FINDER TRANSPORT
========================================= */

import type { SemanticFinderQuery } from '../../contracts/semantic/SemanticFinderQuery'
import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

import { fetchFinderTransport } from './fetchFinderTransport'

/* =========================================
🔥 Finder Transport
========================================= */

export async function finderTransport(
  query: SemanticFinderQuery
): Promise<RecommendationPayload[]> {

  console.log('Finder transport called with query:', query)

  const results = await fetchFinderTransport(query)

  return results
}