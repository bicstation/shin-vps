// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/finder/finder.ts

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Finder Runtime
 * ============================================================================
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic narrowing runtime continuity
 *
 * NOT:
 *
 * semantic meaning generation
 *
 * Responsibilities:
 *
 * - finder runtime continuity
 * - traversal-safe transport
 * - semantic narrowing bridge
 * - payload normalization
 * - migration-safe transport continuity
 *
 * IMPORTANT:
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

/* ============================================================================
🔥 Runtime Observatory
============================================================================ */

import {

  logFinderRuntime,

} from './observatory'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const FINDER_ENDPOINT =
  '/general/finder/'

/* ============================================================================
🔥 Normalize Usage Payload
============================================================================ */

function normalizeUsagePayload(

  usage?: string[]

): string[] {

  if (!usage) {

    return []
  }

  return usage.map((value) => (

    value
      .replace(
        'usage-',
        ''
      )
      .trim()
  ))
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

  /* ========================================================================
  🔥 Endpoint
  ======================================================================== */

  const endpoint =

    buildEndpoint(
      FINDER_ENDPOINT
    )

  /* ========================================================================
  🔥 Payload
  ======================================================================== */

  const payload = {

    usage:

      normalizeUsagePayload(
        query.usage
      ),

    workflow:

      normalizeWorkflowPayload(
        query.workflow
      ),
  }

  /* ========================================================================
  🔥 Runtime Observatory
  ======================================================================== */

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FINDER RUNTIME REQUEST'
  )

  console.log({

    endpoint,
    payload,
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  /* ========================================================================
  🔥 Fetch
  ======================================================================== */

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

  /* ========================================================================
  🔥 Failed Response
  ======================================================================== */

  if (!response.ok) {

    console.error(
      '🔥 Finder Runtime Error:',
      response.status,
    )

    throw new Error(

      `Finder runtime fetch failed: ${response.status}`
    )
  }

  /* ========================================================================
  🔥 Runtime JSON
  ======================================================================== */

  const runtime =

    await response.json()

  /* ========================================================================
  🔥 Observatory
  ======================================================================== */

  logFinderRuntime(
    runtime
  )

  /* ========================================================================
  🔥 Normalize
  ======================================================================== */

  return normalizeFinderRuntime(
    runtime
  )
}