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
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Projection Authority
 *
 * Adapter SHALL:
 *
 * Project
 *
 * ONLY
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

  subtitle?: string

  description?: string

  type?: string

  icon?: string

  color?: string

  parentGroup?: string

  sortOrder?: number | string

  productCount?: number

  attributes?: any[]
}

/* ============================================================================
🔥 Project Navigation Item
============================================================================ */

export function projectNavigationIntent(

  runtime?: NavigationRuntimeItem

): NavigationIntent {

  return {

    slug:

      runtime?.slug ?? '',

    label:

      runtime?.name ?? '',

    title:

      runtime?.title ?? '',

    subtitle:

      runtime?.subtitle ?? '',

    description:

      runtime?.description ?? '',

    type:

      runtime?.type,

    icon:

      runtime?.icon ?? '',

    color:

      runtime?.color ?? '',

    parentGroup:

      runtime?.parent_group,

    sortOrder:

      runtime?.sort_order,

    productCount:

      runtime?.product_count ?? 0,

    attributes:

      runtime?.attributes ?? [],

  }

}

/* ============================================================================
🔥 Project Navigation Collection
============================================================================ */

export function projectNavigationIntents(

  runtimes?: NavigationRuntimeItem[]

): NavigationIntent[] {

  if (!Array.isArray(runtimes)) {

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