// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/intent/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Intent Runtime Normalization Layer
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
 * ❌ generate intent
 * ❌ classify semantics
 * ❌ mutate authority meaning
 * ❌ read TSV authority
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

  IntentRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Intent Runtime
============================================================================ */

export function normalizeIntentRuntime(

  payload?: any

): IntentRuntime {

  const source =

    payload?.data
    ??

    payload
    ??

    {}

  console.log(
    '🔥 INTENT NORMALIZE',
    {

      intent:
        source?.intent,

      confidence:
        source?.confidence,

      ready:
        source?.ready,
    }
  )

  return {

    message:

      source?.message

      ||

      '',

    intent:

      source?.intent

      ||

      '',

    confidence:

      typeof source?.confidence === 'number'

        ? source.confidence

        : 0,

    matched_groups:

      Array.isArray(
        source?.matched_groups
      )

        ? source.matched_groups

        : [],

    unknown_terms:

      Array.isArray(
        source?.unknown_terms
      )

        ? source.unknown_terms

        : [],

    ready:

      source?.ready === true,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeIntentRuntime