// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/discover-detail/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Normalize
 * ============================================================================
 *
 * IMPORTANT
 *
 * Backend remains:
 *
 * semantic authority
 *
 * Adapter remains:
 *
 * transport authority
 *
 * This layer MUST NOT:
 *
 * ❌ generate meaning
 * ❌ create aliases
 * ❌ create products
 * ❌ infer related groups
 *
 * ============================================================================
 */

import type {

  DiscoverDetailRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Discover Detail Runtime
============================================================================ */

export function normalizeDiscoverDetailRuntime(

  payload?: any

): DiscoverDetailRuntime {

  const source =

    payload?.data

    ??

    payload

    ??

    {}

  console.log(
    '🔥 DISCOVER DETAIL NORMALIZE',
    {

      group_slug:
        source?.group_slug,

      group_name:
        source?.group_name,

      product_count:
        source?.product_count,

      aliases:
        source?.aliases?.length,

      sample_products:
        source?.sample_products?.length,
    }
  )

  return {

    found:

      source?.found

      ??

      false,

    group_slug:

      source?.group_slug

      ??

      '',

    group_name:

      source?.group_name

      ??

      '',

    type:

      source?.type

      ??

      '',

    parent_group:

      source?.parent_group

      ??

      '',

    icon:

      source?.icon

      ??

      '',

    color:

      source?.color

      ??

      '',

    sort_order:

      source?.sort_order

      ??

      '',

    description:

      source?.description

      ??

      '',

    product_count:

      source?.product_count

      ??

      0,

    aliases:

      Array.isArray(
        source?.aliases
      )

        ? source.aliases

        : [],

    related_groups:

      Array.isArray(
        source?.related_groups
      )

        ? source.related_groups

        : [],

    sample_products:

      Array.isArray(
        source?.sample_products
      )

        ? source.sample_products

        : [],

    ready:

      source?.ready

      ??

      false,

    raw:
      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverDetailRuntime