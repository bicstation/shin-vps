// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/projection.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderProduct,
  FinderProductRuntime,

} from './contracts'

/* ============================================================================
🔥 Project Finder Product
============================================================================ */

/**
 * Runtime
 *
 * {
 *   product: {...}
 * }
 *
 * Legacy
 *
 * {
 *   ...
 * }
 *
 * ↓
 *
 * UI Contract
 */

export function projectFinderProduct(

  runtime?: FinderProductRuntime | any

): FinderProduct {

  console.log(
    '🔥 PROJECTION INPUT',
    runtime
  )

  console.log(
    '🔥 PROJECTION PRODUCT',
    runtime?.product
  )

  const product =

    runtime?.product
    ?? runtime
    ?? {}

  return {

    /* ======================================================================
    Identity
    ====================================================================== */

    id:
      product?.id,

    unique_id:
      product?.unique_id || '',

    /* ======================================================================
    Basic
    ====================================================================== */

    name:
      product?.name || '',

    maker:
      product?.maker || '',

    brand:
      product?.brand || '',

    description:
      product?.description || '',

    /* ======================================================================
    Media
    ====================================================================== */

    image_url:
      product?.image_url || '',

    /* ======================================================================
    URL
    ====================================================================== */

    url:
      product?.url || '',

    affiliate_url:
      product?.affiliate_url || '',

    /* ======================================================================
    Commerce
    ====================================================================== */

    price:
      product?.price || 0,

    /* ======================================================================
    Runtime Backup
    ====================================================================== */

    raw:
      runtime,
  }
}

/* ============================================================================
🔥 Project Finder Results
============================================================================ */

export function projectFinderResults(

  runtimes?: FinderProductRuntime[]

): FinderProduct[] {

  if (

    !Array.isArray(
      runtimes
    )

  ) {

    return []
  }

  const projected =

    runtimes.map(
      projectFinderProduct
    )

  console.log(

    '🔥 FINDER PROJECTION',

    {

      runtime_count:
        runtimes.length,

      projected_count:
        projected.length,

      sample:
        projected?.[0],
    }
  )

  return projected
}





/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectFinderResults