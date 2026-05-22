// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/orchestrators/RuntimeInspectorRouter.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Orchestrators
============================================================================ */

import EntityInspectorOrchestrator
from './EntityInspectorOrchestrator'

import RankingInspectorOrchestrator
from './RankingInspectorOrchestrator'

import TraversalInspectorOrchestrator
from './TraversalInspectorOrchestrator'

import SidebarInspectorOrchestrator
from './SidebarInspectorOrchestrator'

/* ============================================================================
🔥 Types
============================================================================ */

type RuntimeInspectorRouterProps = {

  mode?: string

  runtime?: any
}

/* ============================================================================
🔥 Runtime Inspector Router
============================================================================ */

/**
 * Runtime inspector routing authority.
 *
 * Responsibilities:
 *
 * - runtime-role-based inspector orchestration
 * - semantic topology continuity
 * - traversal-safe runtime routing
 * - inspector fallback continuity
 *
 * IMPORTANT:
 *
 * Frontend remains observability authority only.
 *
 * Backend remains semantic authority.
 */
export default function RuntimeInspectorRouter({

  mode,

  runtime,

}: RuntimeInspectorRouterProps) {

  // ==========================================================================
  // Runtime Identity
  // ==========================================================================

  const runtimeRole =

    runtime?.runtime_role
    || 'unknown-runtime'

  const topologyLayer =

    runtime?.topology_layer
    || 'unknown-layer'

  const observatory =

    runtime?.observatory
    || 'unknown-observatory'

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🧭 RUNTIME INSPECTOR ROUTER',

    {

      mode,

      runtimeRole,

      topologyLayer,

      observatory,
    }
  )

  // ==========================================================================
  // Entity Runtime
  // ==========================================================================

  if (

    runtimeRole ===
      'entity-runtime'

  ) {

    return (

      <EntityInspectorOrchestrator
        runtime={runtime}
      />

    )
  }

  // ==========================================================================
  // Ranking Runtime
  // ==========================================================================

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

  // ==========================================================================
  // Traversal Runtime
  // ==========================================================================

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

  // ==========================================================================
  // Sidebar Runtime
  // ==========================================================================

  if (

    runtimeRole ===
      'sidebar-runtime'

  ) {

    return (

      <SidebarInspectorOrchestrator
        runtime={runtime}
      />

    )
  }

  // ==========================================================================
  // Unknown Runtime
  // ==========================================================================

  return (

    <div
      className="
        rounded-3xl
        border
        border-amber-900/40
        bg-amber-950/10
        p-8
      "
    >

      <div
        className="
          mb-3
          text-xs
          uppercase
          tracking-[0.3em]
          text-amber-400
        "
      >

        Unknown Runtime Role

      </div>

      <div
        className="
          space-y-2
          text-sm
          text-zinc-300
        "
      >

        <div>

          runtime_role:
          {' '}
          {runtimeRole}

        </div>

        <div>

          topology_layer:
          {' '}
          {topologyLayer}

        </div>

        <div>

          observatory:
          {' '}
          {observatory}

        </div>

      </div>

    </div>
  )
}