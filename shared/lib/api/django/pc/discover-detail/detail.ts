// ============================================================================
// Discover Detail Runtime
// ============================================================================

import { fetchDiscoverDetail } from './gateway'

import { normalizeDiscoverDetailRuntime } from './normalize'

import type {
  DiscoverDetailRuntime,
} from './contracts'

/* ============================================================================
🔥 Fetch Discover Detail Runtime
============================================================================ */

export async function getDiscoverDetail(

  slug: string

): Promise<DiscoverDetailRuntime> {

  const runtime =

    await fetchDiscoverDetail(slug)

  return normalizeDiscoverDetailRuntime(

    runtime

  )
}

/* ============================================================================
🔥 Alias
============================================================================ */

export const fetchDiscoverDetailRuntime =
  getDiscoverDetail

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getDiscoverDetail