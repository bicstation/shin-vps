// /app/concierge/semantic/routing/resolveSemanticDestination.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
} from '../../contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 Resolve Semantic Destination
========================================= */

export function resolveSemanticDestination(
  query?: SemanticFinderQuery
): string {

  if (!query) return '/'

  const parts: string[] = []

  if (query.usage) parts.push(`usage-${query.usage}`)
  if (query.gpu) parts.push(`gpu-${query.gpu}`)
  if (query.cpu) parts.push(`cpu-${query.cpu}`)
  if (query.maker) parts.push(`maker-${query.maker}`)
  if (query.memory) parts.push(`mem-${query.memory}`)
  if (query.storage) parts.push(`storage-${query.storage}`)
  if (query.resolution) parts.push(`res-${query.resolution}`)
  if (query.panel) parts.push(`panel-${query.panel}`)
  if (query.workload) parts.push(`workload-${query.workload}`)
  if (query.ai) parts.push(`ai-${query.ai}`)

  return '/' + parts.join('/')
}