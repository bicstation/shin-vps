// /app/concierge/transport/finder/fetchFinderTransport.ts

/* =========================================
🔥 FETCH FINDER TRANSPORT
========================================= */

import type { SemanticFinderQuery } from '../../contracts/semantic/SemanticFinderQuery'
import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

import { fetchFinderResult } from '../adapters/finderAdapter'

/* =========================================
🔥 Fetch Finder Transport
========================================= */

export async function fetchFinderTransport(
  query: SemanticFinderQuery
): Promise<RecommendationPayload[]> {

  console.log('Transport fetch for finder with query:', query)

  const results = await fetchFinderResult(query)

  return results
}