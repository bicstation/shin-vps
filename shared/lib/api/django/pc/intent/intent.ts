// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/intent/intent.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Intent Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * Natural Language
 *
 * ↓
 *
 * Backend Intent Runtime
 *
 * ↓
 *
 * Stable Intent Runtime
 *
 * IMPORTANT
 *
 * This layer MUST NOT:
 *
 * ❌ generate intent
 * ❌ classify semantics
 * ❌ read TSV authority
 * ❌ mutate runtime meaning
 *
 * RESPONSIBILITY
 *
 * Transport
 * ↓
 * Normalize
 * ↓
 * Runtime
 *
 * ============================================================================
 */

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
🔥 Contracts
============================================================================ */

import type {

  IntentRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

  normalizeIntentRuntime,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const INTENT_ENDPOINT =

  '/pc/intent/'

/* ============================================================================
🔥 Resolve Intent
============================================================================ */

export async function resolveIntent(

  message: string

): Promise<IntentRuntime> {

  console.log(
    '🔥 RESOLVE INTENT'
  )

  if (!message?.trim()) {

    console.warn(
      '⚠️ EMPTY INTENT MESSAGE'
    )

    return normalizeIntentRuntime({
      message: '',
      intent: '',
      confidence: 0,
      matched_groups: [],
      unknown_terms: [],
      ready: false,
    })
  }

  const endpoint =

    buildEndpoint(
      INTENT_ENDPOINT
    )

  console.log(
    '🔥 INTENT ENDPOINT',
    endpoint
  )

  const payload =

    await safeFetch(
      endpoint,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({

          message,
        }),
      }
    )

  console.log(
    '🔥 INTENT RAW PAYLOAD',
    payload
  )

  const runtime =

    normalizeIntentRuntime(
      payload
    )

  console.log(
    '🔥 INTENT RUNTIME',
    {

      intent:
        runtime.intent,

      confidence:
        runtime.confidence,

      ready:
        runtime.ready,
    }
  )

  return runtime
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default resolveIntent