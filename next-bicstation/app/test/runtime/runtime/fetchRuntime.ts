// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/runtime/fetchRuntime.ts
// ============================================================================

/* ============================================================================
🔥 Detail Runtime
============================================================================ */

// import fetchPCDetailRuntime
// from '@/shared/lib/api/django/pc/detail/fetchPCDetailRuntime'

import fetchPCDetailRuntime
from '@/shared/lib/api/django/pc/detail/runtime'



/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

import fetchSemanticRankingRuntime
from '@/shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime'

/* ============================================================================
🔥 Traversal Runtime
============================================================================ */

import fetchTraversalRuntime
from '@/shared/lib/api/django/pc/traversal/fetchTraversalRuntime'

/* ============================================================================
🔥 Sidebar Runtime
============================================================================ */

import {
  fetchSidebar,
} from '@/shared/lib/api/django/pc/sidebar/sidebar'

/* ============================================================================
🔥 Types
============================================================================ */

type RuntimeOptions = {

  uniqueId?: string
}

/* ============================================================================
🔥 Fetch Runtime
============================================================================ */

/**
 * Runtime transport authority.
 *
 * Responsibilities:
 *
 * - runtime mode orchestration
 * - semantic runtime transport routing
 * - topology continuity preservation
 * - observatory-safe runtime delivery
 *
 * IMPORTANT:
 *
 * Frontend does NOT mutate semantic meaning.
 *
 * Backend remains semantic authority.
 */
export async function fetchRuntime(

  mode: string,

  options: RuntimeOptions = {},

) {

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🔥 FETCH RUNTIME',

    {

      mode,

      options,
    }
  )

  // ==========================================================================
  // Detail Runtime
  // ==========================================================================

  if (mode === 'detail') {

    return await fetchPCDetailRuntime(

      options.uniqueId || ''
    )
  }

  // ==========================================================================
  // Ranking Runtime
  // ==========================================================================

  if (mode === 'ranking') {

    console.log(

      '🔥 RANKING RUNTIME PIPELINE',

      {

        pipeline:
          'fetchSemanticRankingRuntime',

        rankingType:
          'score',
      }
    )

    return await fetchSemanticRankingRuntime(

      'score'
    )
  }

  // ==========================================================================
  // Traversal Runtime
  // ==========================================================================

  if (

    mode === 'related'

    ||

    mode === 'traversal'

  ) {

    console.log(

      '🌌 TRAVERSAL RUNTIME PIPELINE',

      {

        pipeline:
          'fetchTraversalRuntime',

        uniqueId:
          options.uniqueId,
      }
    )

    return await fetchTraversalRuntime(

      options.uniqueId || ''
    )
  }

  // ==========================================================================
  // Sidebar Runtime
  // ==========================================================================

  if (mode === 'sidebar') {

    console.log(

      '📦 SIDEBAR RUNTIME PIPELINE',

      {

        pipeline:
          'fetchSidebar',

        topology:
          'navigation-runtime',
      }
    )

    const sidebar =

      await fetchSidebar()

    console.log(

      '📦 SIDEBAR RUNTIME RESPONSE',

      sidebar
    )

    return {

      success: true,

      runtime_role:
        'sidebar-runtime',

      topology_layer:
        'navigation',

      observatory:
        'semantic-sidebar-runtime',

      semantic_authority:
        'backend',

      payload:
        sidebar,

      sidebar,
    }
  }

  // ==========================================================================
  // Unknown Runtime
  // ==========================================================================

  console.warn(

    '⚠ UNKNOWN RUNTIME MODE',

    {

      mode,
    }
  )

  return {

    success: false,

    runtime_role:
      'unknown-runtime',

    topology_layer:
      'unknown',

    observatory:
      'runtime-observatory',

    error:
      `Unknown runtime mode: ${mode}`,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchRuntime