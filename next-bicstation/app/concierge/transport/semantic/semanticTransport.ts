// /app/concierge/transport/semantic/semanticTransport.ts

/* =========================================
🔥 SEMANTIC TRANSPORT
========================================= */

import type { SemanticFinderQuery } from '@/app/concierge/contracts/semantic/SemanticFinderQuery'

import { fetchSemanticTransport } from './fetchSemanticTransport'

/* =========================================
🔥 Semantic Transport
========================================= */

export async function semanticTransportWrapper(
  query?: SemanticFinderQuery
) {

  console.log('Semantic transport wrapper called for query:', query)

  const result = await fetchSemanticTransport(query)

  return result
}