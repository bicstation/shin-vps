// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  TopRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Top Runtime
============================================================================ */

export function normalizeTopRuntime(

  payload?: any

): TopRuntime {

  const source =

    payload
    ?? {}

  const data =

    source?.data
    ?? {}

  const featuredGroups =

    Array.isArray(
      data?.featured_groups
    )

      ? data.featured_groups

      : []

  const featuredProducts =

    Array.isArray(
      data?.featured_products
    )

      ? data.featured_products

      : []

  console.log(
    '🔥 TOP NORMALIZE',
    {

      identity:
        source?.meaning?.identity,

      product_count:
        data?.stats?.product_count,

      featured_groups:
        featuredGroups.length,

      featured_products:
        featuredProducts.length,

      authority_version:
        source?.authority_version,

      semantic_authority:
        source?.semantic_authority,
    }
  )

  return {

    meaning:

      source?.meaning
      || {},

    seo:

      source?.seo
      || {},

    stats:

      data?.stats
      || {},

    featured_groups:

      featuredGroups,

    featured_products:

      featuredProducts,

    semantic_schema_version:

      source?.semantic_schema_version
      || 1,

    authority_version:

      source?.authority_version
      || 'unknown',

    semantic_authority:

      source?.semantic_authority
      || 'backend',

    ready:

      source?.ready === true,

    raw:

      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeTopRuntime