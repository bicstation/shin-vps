// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/navigation/adapter.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Projection Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Runtime
 *
 * ↓
 *
 * Stable UI Contract
 *
 * IMPORTANT
 *
 * This layer MUST NOT:
 *
 * ❌ generate semantic meaning
 * ❌ infer navigation intent
 * ❌ mutate authority data
 * ❌ fabricate runtime values
 *
 * RESPONSIBILITY
 *
 * Runtime
 * ↓
 * Projection
 * ↓
 * UI Contract
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  NavigationRuntimeItem,

} from './contracts'

/* ============================================================================
🔥 Navigation Intent
============================================================================ */

export interface NavigationIntent {

  slug: string

  label: string

  title?: string

  description?: string

  icon?: string

  color?: string

  productCount?: number
}

/* ============================================================================
🔥 Project Navigation Item
============================================================================ */
export function projectNavigationIntent(

  runtime?: NavigationRuntimeItem

): NavigationIntent {

  return {

    slug:
      runtime?.slug || '',

    label:
      runtime?.name || '',

    title:
      runtime?.title || '',

    description:
      runtime?.description || '',

    icon:
      runtime?.icon || '',

    color:
      runtime?.color || '',

    productCount:
      runtime?.product_count || 0,
  }
}


/* ============================================================================
🔥 Project Navigation Collection
============================================================================ */

export function projectNavigationIntents(

  runtimes?: NavigationRuntimeItem[]

): NavigationIntent[] {

  if (

    !Array.isArray(
      runtimes
    )

  ) {

    return []
  }

  const projected =

    runtimes.map(
      projectNavigationIntent
    )

  console.log(

    '🔥 NAVIGATION PROJECTION',

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

export default projectNavigationIntents