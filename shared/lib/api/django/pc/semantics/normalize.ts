// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/semantics/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Runtime Normalization Layer
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
 * ❌ generate universes
 * ❌ generate navigation
 * ❌ infer semantic meaning
 * ❌ mutate authority payload
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

  SemanticRuntime,
  SemanticUniverse,
  SemanticNavigationItem,

} from './contracts'

/* ============================================================================
🔥 Normalize Semantic Runtime
============================================================================ */

export function normalizeSemanticRuntime(

  payload?: any

): SemanticRuntime {

  const source =

    payload?.data
    ??

    payload
    ??

    {}

  const universes: SemanticUniverse[] =

    Array.isArray(
      source?.universes
    )

      ? source.universes

      : []

  const navigation: SemanticNavigationItem[] =

    Array.isArray(
      source?.navigation
    )

      ? source.navigation

      : []
  
  const sidebar: SemanticNavigationItem[] =

    Array.isArray(
      source?.sidebar
    )

      ? source.sidebar

      : []
  
  const discover =

    source?.discover

    ||

    {

      shelves: [],
    }
  
  const meaning =

    source?.meaning

    ||

    {}

  const seo =

    source?.seo

    ||

    {}
  
  const summary =

    source?.summary

    ||

    {}

  console.log(
    '🔥 SEMANTIC NORMALIZE',
    {

      universes:
        universes.length,

      navigation:
        navigation.length,

      sidebar:
        sidebar.length,

      shelves:
        discover?.shelves?.length,

      sample_universe:
        universes?.[0],

      sample_navigation:
        navigation?.[0],
    }
  )

  return {

    universes,

    navigation,

    sidebar,

    discover,

    meaning,

    seo,

    summary,

    raw:
      payload,
  }


}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeSemanticRuntime