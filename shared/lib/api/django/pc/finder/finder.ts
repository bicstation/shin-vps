// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/finder.ts
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Finder Runtime
 * ============================================================================
 *
 * IMPORTANT:
 *
 * This layer exists ONLY for:
 *
 * - runtime continuity
 * - transport bridge continuity
 * - semantic narrowing continuity
 * - traversal-safe transport continuity
 * - runtime observability continuity
 *
 * NOT:
 *
 * - semantic meaning generation
 * - traversal meaning generation
 * - recommendation meaning generation
 *
 * Backend remains:
 *
 * semantic traversal authority
 *
 * Adapter remains:
 *
 * continuity authority
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

  FinderQuery,
  FinderRuntimeResponse,

} from './contracts'

/* ============================================================================
🔥 Utils
============================================================================ */

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeFinderRuntime,

} from './normalize'


import {

  projectFinderResults,

} from './projection'


/* ============================================================================
🔥 Observatory
============================================================================ */

import {

  logFinderRuntime,
  logFinderTransport,
  logFinderError,

} from './observatory'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const FINDER_ENDPOINT =
  '/pc/finder/'

/* ============================================================================
🔥 Normalize Usage Payload
============================================================================ */

// function normalizeUsagePayload(

//   usage?: string[]

// ): string[] {

//   if (!usage) {

//     return []
//   }

//   return usage.map((value) => (

//     value
//       .replace(
//         'usage-',
//         ''
//       )
//       .trim()
//   ))
// }
function normalizeUsagePayload(
  usage?: string[]
): string[] {

  if (!usage) {
    return []
  }

  return usage
}


/* ============================================================================
🔥 Normalize Workflow Payload
============================================================================ */

function normalizeWorkflowPayload(

  workflow?: string[]

): string[] {

  if (!workflow) {

    return []
  }

  return workflow.map((value) => (

    value.trim()
  ))
}

/* ============================================================================
🔥 Fetch Finder Runtime
============================================================================ */

export async function
fetchFinder(

  query:
    FinderQuery = {}

): Promise<
  FinderRuntimeResponse
> {

  try {

    /* ======================================================================
    🔥 Endpoint
    ====================================================================== */

    const endpoint =

      buildEndpoint(
        FINDER_ENDPOINT
      )

    /* ======================================================================
    🔥 Payload
    ====================================================================== */
    console.log(
      '🔥 RAW QUERY USAGE',
      query.usage
    )

    console.log(
      '🔥 FINDER QUERY',
      query
    )

    console.log(
      '🔥 NORMALIZED USAGE',
      normalizeUsagePayload(
        query.usage
      )
    )

    const payload = {

      attributes: [
        normalizeUsagePayload(
          query.usage
        )
      ],

      max_price:
        query.max_price,
    }


    // const payload = {

    //   usage:

    //     normalizeUsagePayload(
    //       query.usage
    //     ),

    //   workflow:

    //     normalizeWorkflowPayload(
    //       query.workflow
    //     ),

    //  budget_max:
    //       query.max_price,
    // }

    console.log(
       '🔥 FINDER REQUEST PAYLOAD',
      JSON.stringify(
        payload,
        null,
        2
      )
    )

    /* ======================================================================
    🔥 Intent Observatory
    ====================================================================== */

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
      '🔥 FINDER INTENT'
    )

    console.log({

      requestedUsage:
        query.usage,

      normalizedUsage:
        payload.usage,

      requestedWorkflow:
        query.workflow,

      normalizedWorkflow:
        payload.workflow,
    })

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ======================================================================
    🔥 Transport Observatory
    ====================================================================== */

    logFinderTransport({

      endpoint,
      payload,
      method:
        'POST',
    })

    /* ======================================================================
    🔥 Fetch
    ====================================================================== */

    const response =

      await fetch(endpoint, {

        method:
          'POST',

        headers: {

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify(
            payload
          ),
      })

    /* ======================================================================
    🔥 Failed Response
    ====================================================================== */

    if (!response.ok) {

      const errorText =

        await response.text()

      logFinderError({

        status:
          response.status,

        statusText:
          response.statusText,

        errorText,
      })

      throw new Error(

        `Finder runtime fetch failed: ${response.status}`
      )
    }

    /* ======================================================================
    🔥 Runtime JSON
    ====================================================================== */

    const runtime =

      await response.json()

    /* ======================================================================
    🔥 Raw Runtime Observatory
    ====================================================================== */

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
      '🔥 RAW FINDER RUNTIME'
    )

    console.log(
      runtime
    )

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ======================================================================
    🔥 Runtime Observatory
    ====================================================================== */

    logFinderRuntime(
      runtime
    )

    /* ======================================================================
    🔥 Normalize
    ====================================================================== */

    console.log(
      '🔥 NORMALIZE INPUT',
      runtime
    )

    const normalized =

      normalizeFinderRuntime(
        runtime
      )
    

    /* ======================================================================
    🔥 Projection
    ====================================================================== */

    const projectedResults =

      projectFinderResults(
        normalized.results
      )

    console.log(
      '🔥 FINDER PROJECTION APPLIED',
      {

        runtime_results:
          normalized.results?.length || 0,

        projected_results:
          projectedResults.length,

        sample:
          projectedResults?.[0],
      }
    )

    /* ======================================================================
    🔥 Normalized Runtime Observatory
    ====================================================================== */

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
      '🔥 NORMALIZED FINDER RUNTIME'
    )

    console.log({

      resultCount:

        normalized.results
          ?.length

        || 0,

      workflowTags:
        normalized.workflow_tags,

      nextShelves:
        normalized.next_shelves,

      semanticRuntime:
        normalized.semantic_runtime,

      adaptiveRuntime:
        normalized.adaptive_runtime,
    })

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )


    console.log(
      '🔥 NORMALIZE OUTPUT',
      normalized
    )

    /* ======================================================================
    🔥 Return
    ====================================================================== */

    // return normalized

    return {

      ...normalized,

      results:
        projectedResults,
    }

  } catch (error) {

    /* ======================================================================
    🔥 Error Observatory
    ====================================================================== */

    logFinderError(
      error
    )

    /* ======================================================================
    🔥 Safe Runtime Fallback
    ====================================================================== */

    return {

      success: false,

      results: [],

      workflow_tags: [],

      next_shelves: [],

      semantic_runtime:
        null,

      adaptive_runtime:
        null,

      runtime_status:
        'runtime-error',
    }
  }
}


