// /app/concierge/transport/semantic/fetchSemanticTransport.ts

/* =========================================
🔥 FETCH SEMANTIC TRANSPORT
========================================= */

import type { SemanticFinderQuery } from '@/app/concierge/contracts/semantic/SemanticFinderQuery'

import { semanticTransport } from '../internal/semanticTransport'

/* =========================================
🔥 Fetch Semantic Transport
========================================= */

export async function fetchSemanticTransport(
  query?: SemanticFinderQuery
) {

  console.log('Fetching semantic transport for query:', query)

  const response = await semanticTransport(query)

  return response
}