// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/navigation/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Runtime Normalization Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * Runtime Shape
 *
 * ↓
 *
 * Stable Runtime Contract
 *
 * IMPORTANT
 *
 * This layer MUST NOT:
 *
 * ❌ generate semantic meaning
 * ❌ create navigation intent
 * ❌ perform UI projection
 * ❌ fabricate runtime values
 *
 * RESPONSIBILITY
 *
 * Backend Runtime
 * ↓
 * Runtime Contract
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  NavigationRuntime,
  NavigationRuntimeResponse,
  NavigationRuntimeItem,

} from './contracts'

/* ============================================================================
🔥 Normalize Navigation
============================================================================ */

export function normalizeNavigation(

  payload?: any

): NavigationRuntime {

  /* ========================================================================
  Compatibility Layer
  ======================================================================== */

  const source =

    payload?.data
    ?? payload
    ?? {}

  /* ========================================================================
  Navigation
  ======================================================================== */

  const navigation: NavigationRuntimeItem[] =

    Array.isArray(
      source?.navigation
    )

      ? source.navigation

      : Array.isArray(
          source?.items
        )

        ? source.items

        : []

  /* ========================================================================
  Observatory
  ======================================================================== */

  console.log(
    '🔥 NAVIGATION NORMALIZE',
    {

      items:
        navigation.length,

      authority_version:
        source?.authority_version,

      semantic_authority:
        source?.semantic_authority,

      sample:
        navigation?.[0],
    }
  )

  /* ========================================================================
  Return
  ======================================================================== */

  return {

    semantic_authority:

      source?.semantic_authority

      ||

      'backend',

    authority_version:

      source?.authority_version

      ||

      'unknown',

    navigation,

    raw:
      payload,
  }
}

/* ============================================================================
🔥 Normalize Navigation Response
============================================================================ */

export function normalizeNavigationResponse(

  payload?: any

): NavigationRuntimeResponse {

  const runtime =

    normalizeNavigation(
      payload
    )

  return {

    success:
      true,

    semantic_authority:
      runtime.semantic_authority,

    authority_version:
      runtime.authority_version,

    navigation:
      runtime.navigation,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeNavigation