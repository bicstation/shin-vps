// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/ranking/RankingPayloadInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Payload Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Raw ranking payload observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * backend ranking authority payload inspection
 *
 * NOT:
 *
 * payload normalization
 * semantic transformation
 * ranking mutation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorSection
from '../shared/InspectorSection'

import RuntimeBadge
from '../shared/RuntimeBadge'

import RawJsonInspector
from '../shared/RawJsonInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type RankingPayloadInspectorProps = {

  payload?: any
}

/* ============================================================================
🔥 Ranking Payload Inspector
============================================================================ */

export default function RankingPayloadInspector({

  payload,

}: RankingPayloadInspectorProps) {

  /* ==========================================================================
  🔥 Safe Payload
  ========================================================================== */

  const rankingPayload =

    payload || {}

  /* ==========================================================================
  🔥 Ranking Runtime
  ========================================================================== */

  const ranking =

    rankingPayload?.ranking
    || {}

  /* ==========================================================================
  🔥 Results
  ========================================================================== */

  const results =

    Array.isArray(
      ranking?.results
    )

      ? ranking.results

      : []

  /* ==========================================================================
  🔥 Payload Metadata
  ========================================================================== */

  const payloadKeys =

    Object.keys(
      rankingPayload
    )

  const payloadSize =

    JSON.stringify(
      rankingPayload
    ).length

  const semanticRuntime =

    rankingPayload?.semantic_runtime
    || '-'

  const semanticSlug =

    rankingPayload?.semantic_slug
    || '-'

  /* ==========================================================================
  🔥 Runtime Integrity
  ========================================================================== */

  const hasPayload =

    payloadKeys.length > 0

  const hasResults =

    results.length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🧾 RANKING PAYLOAD INSPECTOR',

    {

      payloadKeys:

        payloadKeys.length,

      payloadSize,

      semanticRuntime,

      semanticSlug,

      results:

        results.length,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🧾 Ranking Payload Inspector"

      description="Raw ranking payload observability and backend authority payload inspection."

      badge="runtime/ranking-payload"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="payload"

          value={
            hasPayload
              ? 'active'
              : 'empty'
          }

          variant={
            hasPayload
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

          label="results"

          value={
            String(
              results.length
            )
          }

          variant={
            hasResults
              ? 'topology'
              : 'warning'
          }

        />

      </div>

      {/* ================================================================
      🔥 Payload Summary
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-zinc-800 bg-black p-4">

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            Payload Keys

          </div>

          <div className="mt-3 text-sm text-zinc-100">

            {payloadKeys.length}

          </div>

        </div>

        <div className="rounded-xl border border-zinc-800 bg-black p-4">

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            Payload Size

          </div>

          <div className="mt-3 text-sm text-zinc-100">

            {payloadSize.toLocaleString()} bytes

          </div>

        </div>

        <div className="rounded-xl border border-zinc-800 bg-black p-4">

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            Semantic Slug

          </div>

          <div className="mt-3 text-sm text-zinc-100">

            {semanticSlug}

          </div>

        </div>

        <div className="rounded-xl border border-zinc-800 bg-black p-4">

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            Loaded Results

          </div>

          <div className="mt-3 text-sm text-zinc-100">

            {results.length}

          </div>

        </div>

      </div>

      {/* ================================================================
      🔥 Payload Keys
      ================================================================ */}

      <div className="rounded-2xl border border-zinc-800 bg-black p-6">

        <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">

          Payload Keys

        </div>

        {

          payloadKeys.length > 0

            ? (

                <div className="mt-4 flex flex-wrap gap-3">

                  {

                    payloadKeys.map(

                      (

                        key: string

                      ) => (

                        <div

                          key={key}

                          className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-300"

                        >

                          {key}

                        </div>
                      )
                    )
                  }

                </div>
              )

            : (

                <div className="mt-4 text-sm text-zinc-500">

                  No payload keys detected.

                </div>
              )
        }

      </div>

      {/* ================================================================
      🔥 Raw Ranking Payload
      ================================================================ */}

      <RawJsonInspector

        title="Raw Ranking Payload"

        description="Raw ranking runtime payload authority observability and transport-safe backend payload inspection."

        badge="runtime/ranking-payload-raw"

        payload={rankingPayload}

      />

    </InspectorSection>
  )
}