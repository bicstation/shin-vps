// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/navigation/navigation.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * GET /api/pc/navigation/
 *
 * ↓
 *
 * Navigation Runtime
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
 * Transport
 * Normalize
 * Project
 * Observe
 *
 * ONLY
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  NavigationRuntime,

} from './contracts'

/* ============================================================================
🔥 Utils
============================================================================ */

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeNavigation,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const NAVIGATION_ENDPOINT =

  '/pc/navigation/'

/* ============================================================================
🔥 Fetch Navigation Runtime
============================================================================ */

export async function fetchNavigationRuntime(

): Promise<NavigationRuntime> {

  /* ==========================================================================
  Endpoint
  ========================================================================== */

  const endpoint =

    buildEndpoint(

      NAVIGATION_ENDPOINT

    )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

  )

  console.log(

    '🔥 FETCH NAVIGATION RUNTIME'

  )

  console.log({

    endpoint,

  })

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

  )

  /* ==========================================================================
  Fetch
  ========================================================================== */

  const payload =

    await safeFetch<NavigationRuntime>(

      endpoint

    )

  console.log(

    '🔥 NAVIGATION RAW PAYLOAD',

    payload

  )

  /* ==========================================================================
  Failure
  ========================================================================== */

  if (!payload) {

    console.warn(

      '⚠️ NAVIGATION RUNTIME EMPTY'

    )

    return normalizeNavigation()

  }

  /* ==========================================================================
  Normalize
  ========================================================================== */

  const runtime =

    normalizeNavigation(

      payload

    )

  /* ==========================================================================
  Runtime Observability
  ========================================================================== */

  console.log(

    '🔥 NAVIGATION RUNTIME',

    {

      meaning:

        runtime.meaning,

      presentation:

        runtime.presentation,

      seo:

        runtime.seo,

      intents:

        runtime.intents?.length,

      semantic_schema_version:

        runtime.semantic_schema_version,

      authority_version:

        runtime.authority_version,

      semantic_authority:

        runtime.semantic_authority,

      ready:

        runtime.ready,

      sample:

        runtime.intents?.[0],

    }

  )

  /* ==========================================================================
  Success
  ========================================================================== */

  return runtime

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchNavigationRuntime