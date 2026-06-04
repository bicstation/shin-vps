// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/SemanticRuntimeInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Runtime Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Semantic runtime observability gateway
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * runtime topology aware inspector routing
 *
 * NOT:
 *
 * semantic normalization
 * payload mutation
 * runtime orchestration
 * traversal transformation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Router
============================================================================ */

import RuntimeInspectorRouter
from '../orchestrators/RuntimeInspectorRouter'

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorSection
from './shared/InspectorSection'

import RuntimeBadge
from './shared/RuntimeBadge'

/* ============================================================================
🔥 Props
============================================================================ */

type SemanticRuntimeInspectorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Semantic Runtime Inspector
============================================================================ */

export default function SemanticRuntimeInspector({

  runtime,

}: SemanticRuntimeInspectorProps) {

  /* ==========================================================================
  🔥 Runtime Metadata
  ========================================================================== */

  const runtimeRole =

    runtime?.runtime_role
    || '-'

  const topologyLayer =

    runtime?.topology_layer
    || '-'

  const observatory =

    runtime?.observatory
    || '-'

  const endpoint =

    runtime?.endpoint
    || '-'

  /* ==========================================================================
  🔥 Runtime Payload
  ========================================================================== */

  const payload =

    runtime?.payload
    || {}

  /* ==========================================================================
  🔥 Runtime Status
  ========================================================================== */

  const runtimeActive =

    Object.keys(
      payload
    ).length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🧠 SEMANTIC RUNTIME GATEWAY',

    {

      runtimeRole,

      topologyLayer,

      observatory,

      endpoint,

      runtimeActive,
    }
  )

  /* ==========================================================================
  🔥 Empty Guard
  ========================================================================== */

  if (

    !runtime

  ) {

    console.warn(

      '⚠️ SEMANTIC RUNTIME GATEWAY EMPTY',

      {

        runtime,
      }
    )

    return (

      <InspectorSection

        title="🧠 Semantic Runtime Gateway"

        description="Semantic runtime observability gateway and topology-aware runtime inspector entrypoint."

        badge="runtime/gateway"

      >

        <div className="rounded-2xl border border-yellow-900 bg-yellow-950/30 p-6">

          <div className="text-sm font-bold text-yellow-400">

            Runtime Payload Missing

          </div>

          <div className="mt-2 text-sm leading-7 text-yellow-200">

            Semantic runtime gateway could not resolve
            runtime observability payload.

          </div>

        </div>

      </InspectorSection>
    )
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className="space-y-8">

      {/* ================================================================
      🔥 Semantic Runtime Gateway
      ================================================================ */}

      <InspectorSection

        title="🧠 Semantic Runtime Gateway"

        description="Semantic runtime observability gateway and runtime topology routing layer."

        badge="runtime/gateway"

      >

        {/* ============================================================
        🔥 Runtime Status
        ============================================================ */}

        <div className="flex flex-wrap gap-3">

          <RuntimeBadge

            label="runtime"

            value={
              runtimeActive
                ? 'active'
                : 'inactive'
            }

            variant={
              runtimeActive
                ? 'success'
                : 'warning'
            }

          />

          <RuntimeBadge

            label="role"

            value={runtimeRole}

            variant="semantic"

          />

          <RuntimeBadge

            label="topology"

            value={topologyLayer}

            variant="topology"

          />

        </div>

        {/* ============================================================
        🔥 Runtime Metadata
        ============================================================ */}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-zinc-800 bg-black p-4">

            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

              Runtime Role

            </div>

            <div className="mt-3 text-sm text-zinc-100">

              {runtimeRole}

            </div>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-black p-4">

            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

              Topology Layer

            </div>

            <div className="mt-3 text-sm text-zinc-100">

              {topologyLayer}

            </div>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-black p-4">

            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

              Observatory

            </div>

            <div className="mt-3 text-sm text-zinc-100">

              {observatory}

            </div>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-black p-4">

            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

              Endpoint

            </div>

            <div className="mt-3 break-all text-sm text-zinc-100">

              {endpoint}

            </div>

          </div>

        </div>

      </InspectorSection>

      {/* ================================================================
      🔥 Runtime Inspector Router
      ================================================================ */}

      <RuntimeInspectorRouter

        runtime={runtime}

      />

    </div>
  )
}