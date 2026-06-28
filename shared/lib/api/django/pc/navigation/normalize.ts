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
 * Backend Runtime
 * ↓
 * Stable Runtime Contract
 *
 * Adapter SHALL:
 *
 * Transport
 * Normalize
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

  NavigationRuntime,
  NavigationRuntimeItem,

} from './contracts'

/* ============================================================================
🔥 Normalize Navigation
============================================================================ */

export function normalizeNavigation(

  payload?: any

): NavigationRuntime {

  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (!payload) {

    return {

      meaning: {},

      presentation: {},

      seo: {},

      intents: [],

      semantic_schema_version: 1,

      authority_version: '',

      semantic_authority: '',

      ready: false,

      raw: null,

    }

  }

  /* ==========================================================================
  Runtime Source
  ========================================================================== */

  const source =

    payload?.data

    ??

    payload

    ??

    {}

  /* ==========================================================================
  Navigation Intents
  ========================================================================== */

  const intents: NavigationRuntimeItem[] =

    Array.isArray(

      source?.intents

    )

      ? source.intents

    : Array.isArray(

        source?.navigation

      )

      ? source.navigation

    : Array.isArray(

        source?.items

      )

      ? source.items

    : []

  /* ==========================================================================
  Observability
  ========================================================================== */

  console.log(

    '🔥 NAVIGATION NORMALIZE',

    {

      source:

        Array.isArray(source?.intents)

          ? 'intents'

        : Array.isArray(source?.navigation)

          ? 'navigation'

        : Array.isArray(source?.items)

          ? 'items'

        : 'unknown',

      intents:

        intents.length,

      meaning:

        payload?.meaning,

      presentation:

        payload?.presentation,

      semantic_schema_version:

        payload?.semantic_schema_version,

      authority_version:

        payload?.authority_version,

      semantic_authority:

        payload?.semantic_authority,

      ready:

        payload?.ready,

      sample:

        intents?.[0],

    }

  )

  /* ==========================================================================
  Runtime Projection
  ========================================================================== */

  return {

    meaning:

      payload?.meaning

      ||

      {},

    presentation:

      payload?.presentation

      ||

      {},

    seo:

      payload?.seo

      ||

      {},

    intents,

    semantic_schema_version:

      payload?.semantic_schema_version

      ??

      1,

    authority_version:

      payload?.authority_version

      ??

      '',

    semantic_authority:

      payload?.semantic_authority

      ??

      '',

    ready:

      payload?.ready

      ??

      false,

    raw:

      payload,

  }

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeNavigation