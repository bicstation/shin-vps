// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/runtime/fetchSemanticShelfRuntime.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Semantic Shelf Runtime Fetch
 * ============================================================================
 *
 * PURPOSE:
 *   - fetch semantic discovery traversal runtime
 *   - fetch semantic shelf continuity
 *   - frontend traversal runtime access
 *
 * IMPORTANT:
 *   - backend remains semantic traversal authority
 *   - frontend remains topology-agnostic
 *   - adapter absorbs traversal continuity
 *
 * ============================================================================
 */

import {
  buildEndpoint,
} from '@/shared/lib/api/django/pc/utils/buildEndpoint'

import type {
  SemanticShelfRuntimeResponse,
} from './contracts'

/* ============================================================================
🔥 Shelf Traversal Aliases
============================================================================ */

const SHELF_ALIASES: Record<string, string> = {

  'usage-ai':
    'ai_workflow',

  'usage-gaming':
    'gaming_setup',

  'usage-creator':
    'creator_workflow',

  'usage-mobile':
    'mobility_workflow',

  'memory-heavy':
    'semantic_richness',
}

/* ============================================================================
🔥 Resolve Shelf Type
============================================================================ */

function resolveShelfType(

  attribute: string

): string {

  return (

    SHELF_ALIASES[
      attribute
    ]

    || attribute
  )
}

/* ============================================================================
🔥 Fetch Semantic Shelf Runtime
============================================================================ */

export async function fetchSemanticShelfRuntime(

  attribute: string

): Promise<SemanticShelfRuntimeResponse> {

  try {

    /* ======================================================================
    🔥 Resolve Shelf Type
    ====================================================================== */

    const shelfType =

      resolveShelfType(
        attribute
      )

    /* ======================================================================
    🔥 Endpoint
    ====================================================================== */

    const endpoint =
      buildEndpoint(
        `/general/semantic/discovery/?shelf=${shelfType}`
      )

    /* ======================================================================
    🔥 Observatory
    ====================================================================== */

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
      '🔥 DISCOVER SHELF FETCH'
    )

    console.log({

      attribute,

      shelfType,

      endpoint,
    })

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ======================================================================
    🔥 Fetch
    ====================================================================== */

    const response =
      await fetch(
        endpoint,
        {
          cache:
            'no-store',
        }
      )

    /* ======================================================================
    🔥 Error
    ====================================================================== */

    if (!response.ok) {

      throw new Error(
        `Failed semantic discovery shelf runtime: ${attribute}`
      )
    }

    /* ======================================================================
    🔥 JSON
    ====================================================================== */

    const runtime =
      await response.json()

    /* ======================================================================
    🔥 Runtime Observatory
    ====================================================================== */

    console.log(
      '🔥 DISCOVERY RUNTIME RESPONSE',
      {

        attribute,

        shelfType,

        semanticShelves:
          runtime?.semantic_shelves?.length,

        nextShelves:
          runtime?.next_shelves,

        workflowTags:
          runtime?.workflow_tags,
      }
    )

    /* ======================================================================
    🔥 Resolve Semantic Shelf
    ====================================================================== */

    const semanticShelves =

      Array.isArray(
        runtime?.semantic_shelves
      )

        ? runtime.semantic_shelves

        : []

    const matchedShelf =

      semanticShelves.find(
        (
          shelf: any
        ) => (

          shelf?.shelf_type
          === shelfType
        )
      )

    /* ======================================================================
    🔥 Shelf Observatory
    ====================================================================== */

    console.log(
      '🔥 MATCHED SHELF',
      {

        shelfType,

        found:
          !!matchedShelf,

        products:
          matchedShelf
            ?.products
            ?.length,

        nextShelves:
          matchedShelf
            ?.next_shelves,
      }
    )

    /* ======================================================================
    🔥 Return Runtime
    ====================================================================== */

    return {

      success:
        true,

      shelf:
        shelfType,

      count:

        matchedShelf
          ?.products
          ?.length

          || 0,

      products:

        Array.isArray(
          matchedShelf?.products
        )

          ? matchedShelf.products

          : [],

      next_shelves:

        Array.isArray(
          matchedShelf?.next_shelves
        )

          ? matchedShelf.next_shelves

          : [],

      raw:
        runtime,
    }

  } catch (error) {

    console.error(
      '🔥 Semantic Shelf Runtime Error:',
      attribute,
      error
    )

    /* ======================================================================
    🔥 Safe Runtime
    ====================================================================== */

    return {

      success:
        false,

      shelf:
        attribute,

      count:
        0,

      products: [],

      next_shelves: [],
    }
  }
}

export default fetchSemanticShelfRuntime