// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/ranking/RankingRuntimeInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Ranking runtime observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * ranking orchestration runtime visualization
 *
 * NOT:
 *
 * semantic normalization
 * runtime mutation
 * collection transformation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorSection
from '../shared/InspectorSection'

import InspectorCard
from '../shared/InspectorCard'

import RuntimeBadge
from '../shared/RuntimeBadge'

import RawJsonInspector
from '../shared/RawJsonInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type RankingRuntimeInspectorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Ranking Runtime Inspector
============================================================================ */

export default function RankingRuntimeInspector({

  runtime,

}: RankingRuntimeInspectorProps) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const rankingRuntime =

    runtime || {}

  /* ==========================================================================
  🔥 Payload
  ========================================================================== */

  const payload =

    rankingRuntime?.payload
    || {}

  /* ==========================================================================
  🔥 Runtime Metadata
  ========================================================================== */

  const runtimeRole =

    rankingRuntime?.runtime_role
    || '-'

  const topologyLayer =

    rankingRuntime?.topology_layer
    || '-'

  const observatory =

    rankingRuntime?.observatory
    || '-'

  const endpoint =

    rankingRuntime?.endpoint
    || '-'

  /* ==========================================================================
  🔥 Ranking Runtime
  ========================================================================== */

  const semanticRuntime =

    payload?.semantic_runtime
    || '-'

  const semanticSlug =

    payload?.semantic_slug
    || '-'

  const rankingMode =

    payload?.ranking_mode
    || '-'

  /* ==========================================================================
  🔥 Ranking Results
  ========================================================================== */

  const ranking =

    payload?.ranking
    || {}

  const results =

    Array.isArray(
      ranking?.results
    )

      ? ranking.results

      : []

  const total =

    ranking?.total
    || results.length
    || 0

  /* ==========================================================================
  🔥 Runtime Integrity
  ========================================================================== */

  const runtimeActive =

    !!payload
    && Object.keys(payload).length > 0

  const hasResults =

    results.length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🏆 RANKING RUNTIME INSPECTOR',

    {

      runtimeRole,

      topologyLayer,

      observatory,

      endpoint,

      semanticRuntime,

      semanticSlug,

      rankingMode,

      total,

      results:

        results.length,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🏆 Ranking Runtime Inspector"

      description="Ranking orchestration runtime observability and collection topology visualization."

      badge="runtime/ranking"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

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

          label="semantic"

          value={
            String(
              semanticRuntime
            )
          }

          variant="semantic"

        />

        <RuntimeBadge

          label="topology"

          value={topologyLayer}

          variant="topology"

        />

      </div>

      {/* ================================================================
      🔥 Runtime Grid
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <InspectorCard

          title="Runtime Role"

          value={runtimeRole}

        />

        <InspectorCard

          title="Topology Layer"

          value={topologyLayer}

        />

        <InspectorCard

          title="Semantic Slug"

          value={semanticSlug}

        />

        <InspectorCard

          title="Ranking Mode"

          value={rankingMode}

        />

        <InspectorCard

          title="Observatory"

          value={observatory}

        />

        <InspectorCard

          title="Semantic Runtime"

          value={semanticRuntime}

        />

        <InspectorCard

          title="Total Results"

          value={total}

        />

        <InspectorCard

          title="Loaded Results"

          value={results.length}

        />

      </div>

      {/* ================================================================
      🔥 Endpoint
      ================================================================ */}

      <InspectorCard

        title="Canonical Endpoint"

        value={endpoint}

        badge="runtime/endpoint"

        description="Canonical ranking runtime entrypoint and orchestration transport endpoint."

      />

      {/* ================================================================
      🔥 Runtime Integrity
      ================================================================ */}

      <div className="rounded-2xl border border-zinc-800 bg-black p-6">

        <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">

          Runtime Integrity

        </div>

        <div className="mt-4 space-y-3 text-sm text-zinc-300">

          <div>
            {runtimeActive ? '✅' : '❌'} Runtime payload active
          </div>

          <div>
            {hasResults ? '✅' : '❌'} Ranking collection loaded
          </div>

          <div>
            ✅ Ranking orchestration observability enabled
          </div>

          <div>
            ❌ Runtime mutation prohibited
          </div>

        </div>

      </div>

      {/* ================================================================
      🔥 Raw Runtime Payload
      ================================================================ */}

      <RawJsonInspector

        title="Raw Ranking Runtime"

        description="Raw ranking orchestration runtime authority payload observability."

        badge="runtime/ranking-raw"

        payload={payload}

      />

    </InspectorSection>
  )
}