// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/orchestrators/RuntimeInspectorRouter.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Runtime Inspector Router
 * ============================================================================
 *
 * PURPOSE:
 *
 * Runtime topology aware inspector routing
 *
 * IMPORTANT:
 *
 * This router exists for:
 *
 * runtime-role-based inspector orchestration
 *
 * NOT:
 *
 * semantic normalization
 * payload mutation
 * runtime transformation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Entity Runtime
============================================================================ */

import EntityInspectorOrchestrator from './EntityInspectorOrchestrator'

/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

import RankingInspectorOrchestrator from './RankingInspectorOrchestrator'

/* ============================================================================
🔥 Traversal Runtime
============================================================================ */

import TraversalInspectorOrchestrator from './TraversalInspectorOrchestrator'

/* ============================================================================
🔥 Props
============================================================================ */

type RuntimeInspectorRouterProps = {

  runtime?: any
}

/* ============================================================================
🔥 Runtime Inspector Router
============================================================================ */

export default function RuntimeInspectorRouter({

  runtime,

}: RuntimeInspectorRouterProps) {

  /* ==========================================================================
  🔥 Runtime Role
  ========================================================================== */

  const runtimeRole =

    runtime?.runtime_role
    || '-'

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🛰️ RUNTIME INSPECTOR ROUTER',

    {

      runtimeRole,

      topologyLayer:

        runtime?.topology_layer,

      observatory:

        runtime?.observatory,

      endpoint:

        runtime?.endpoint,
    }
  )

  /* ==========================================================================
  🔥 Product Runtime
  ========================================================================== */

  if (

    runtimeRole ===
    'product-runtime'

  ) {

    return (

      <EntityInspectorOrchestrator
        runtime={runtime}
      />

    )
  }

  /* ==========================================================================
  🔥 Ranking Runtime
  ========================================================================== */

  if (

    runtimeRole ===
    'ranking-runtime'

  ) {

    return (

      <RankingInspectorOrchestrator
        runtime={runtime}
      />

    )
  }

  /* ==========================================================================
  🔥 Traversal Runtime
  ========================================================================== */

  if (

    runtimeRole ===
      'traversal-runtime'

    ||

    runtimeRole ===
      'continuation-runtime'

  ) {

    return (

      <TraversalInspectorOrchestrator
        runtime={runtime}
      />

    )
  }

  /* ==========================================================================
  🔥 Unknown Runtime
  ========================================================================== */

  console.warn(

    '⚠️ UNKNOWN RUNTIME ROLE',

    {

      runtimeRole,

      runtime,
    }
  )

  /* ==========================================================================
  🔥 Empty Fallback
  ========================================================================== */

  return (

    <section className="rounded-xl border border-red-900 bg-red-950/30 p-6">

      <div className="text-sm font-bold text-red-400">

        Unknown Runtime Role

      </div>

      <div className="mt-2 text-xs text-red-300">

        Runtime inspector router could not resolve
        runtime topology orchestration.

      </div>

      <pre className="mt-4 overflow-x-auto rounded-lg border border-red-900 bg-black p-4 text-xs leading-6 text-red-300">

{JSON.stringify(

  {

    runtime_role:
      runtimeRole,

    topology_layer:
      runtime?.topology_layer,

    observatory:
      runtime?.observatory,

    endpoint:
      runtime?.endpoint,
  },

  null,

  2
)}

      </pre>

    </section>
  )
}