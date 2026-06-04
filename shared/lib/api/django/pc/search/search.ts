// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/search/search.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  SemanticSearchQuery,

  SemanticSearchResponse,

  SemanticProduct,

} from './contracts'

/* =========================================
🔥 Finder Runtime Bridge
========================================= */

import {

  fetchFinder,

} from '../finder'

/* =========================================
🔥 Normalize
========================================= */

import {

  normalizeSemanticSearch,

} from './normalize'

/* =========================================
🔥 Search Runtime Bridge
========================================= */

/**
 * IMPORTANT:
 *
 * This layer now acts as:
 *
 * temporary runtime continuity bridge
 *
 * Responsibilities:
 *
 * - legacy frontend continuity
 * - runtime migration stabilization
 * - semantic narrowing bridge continuity
 *
 * IMPORTANT:
 *
 * Adapter does NOT:
 *
 * - generate semantic meaning
 * - redefine traversal meaning
 * - fabricate workflow meaning
 *
 * Backend remains:
 *
 * semantic traversal authority
 */

/* =========================================
🔥 Search
========================================= */

export async function
searchPC(

  query?:
    SemanticSearchQuery

): Promise<
  SemanticSearchResponse<
    SemanticProduct
  >
> {

  /* =======================================
  🔥 Normalize Usage
  ======================================= */

  const usage =

    query?.usage

      ?.replace(
        'usage-',
        ''
      )

  /* =======================================
  🔥 Finder Runtime Bridge
  ======================================= */

  const response =

    await fetchFinder({

      usage:
        usage
          ? [usage]
          : [],
    })

  /* =======================================
  🔥 Invalid Response
  ======================================= */

  if (!response) {

    return {

      success: false,

      results: [],

      total: 0,

      semantic_schema_version:
        1,
    }
  }

  /* =======================================
  🔥 Runtime Bridge Normalize
  ======================================= */

  return normalizeSemanticSearch({

    success: true,

    results:

      response.results
      || [],

    total:

      response.meta
        ?.total_products

      || response.results
        ?.length

      || 0,

    semantic_schema_version:
      1,
  })
}

/* =========================================
🔥 Preset Search
========================================= */

export async function
searchGamingPC() {

  return searchPC({

    usage:
      'usage-gaming',
  })
}

export async function
searchCreatorPC() {

  return searchPC({

    usage:
      'usage-creator',
  })
}

export async function
searchBusinessPC() {

  return searchPC({

    usage:
      'usage-business',
  })
}

export async function
searchAIPC() {

  return searchPC({

    usage:
      'usage-ai',
  })
}