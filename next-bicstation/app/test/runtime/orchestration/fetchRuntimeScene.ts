// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/orchestration/fetchRuntimeScene.ts
// ============================================================================

/* ============================================================================
🔥 Runtime
============================================================================ */

import fetchRuntime
from '../runtime/fetchRuntime'

import {
  normalizeRuntimePayload,
} from '../runtime/normalizeRuntimePayload'

/* ============================================================================
🔥 Orchestration
============================================================================ */

import { 
  buildRuntimeScene
} from './buildRuntimeScene'

/* ============================================================================
🔥 Types
============================================================================ */

type FetchRuntimeSceneOptions = {

  mode?: string

  options?: {

    uniqueId?: string
  }
}

/* ============================================================================
🔥 Fetch Runtime Scene
============================================================================ */

/**
 * Runtime lifecycle orchestration layer.
 *
 * Responsibilities:
 *
 * - runtime transport orchestration
 * - canonical runtime normalization
 * - runtime scene construction
 * - observatory continuity preservation
 *
 * IMPORTANT:
 *
 * Frontend does NOT mutate semantic meaning.
 *
 * Backend remains semantic authority.
 */


export async function fetchRuntimeScene({

  mode = 'detail',

  options = {},

}: FetchRuntimeSceneOptions) {

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🚀 FETCH RUNTIME SCENE',

    {

      mode,

      options,
    }
  )

  // ==========================================================================
  // Runtime Transport
  // ==========================================================================

  const transport =

    await fetchRuntime(

      mode,

      options

    )

  // ==========================================================================
  // Normalize Runtime
  // ==========================================================================

  const normalized =

    normalizeRuntimePayload(

      transport

    )

  // ==========================================================================
  // Build Runtime Scene
  // ==========================================================================

  const runtimeScene =

    buildRuntimeScene({

      runtime:
        normalized,
    })

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🏗️ RUNTIME SCENE RESOLVED',

    {

      runtimeRole:
        runtimeScene?.runtime_role,

      topologyLayer:
        runtimeScene?.topology_layer,

      observatory:
        runtimeScene?.observatory,

      runtimeActive:
        runtimeScene?.runtime_active,
    }
  )

  // ==========================================================================
  // Return
  // ==========================================================================

  return runtimeScene
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRuntimeScene

