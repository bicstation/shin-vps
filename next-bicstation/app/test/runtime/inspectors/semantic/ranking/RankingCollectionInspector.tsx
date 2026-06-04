// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/ranking/RankingCollectionInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Collection Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Ranking collection observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * collection topology visualization
 *
 * NOT:
 *
 * ranking normalization
 * semantic mutation
 * product transformation
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

type RankingCollectionInspectorProps = {

  ranking?: any

  results?: any[]
}

/* ============================================================================
🔥 Ranking Collection Inspector
============================================================================ */

export default function RankingCollectionInspector({

  ranking,

  results,

}: RankingCollectionInspectorProps) {

  /* ==========================================================================
  🔥 Ranking
  ========================================================================== */

  const rankingRuntime =

    ranking || {}

  /* ==========================================================================
  🔥 Results
  ========================================================================== */

  const rankingResults =

    Array.isArray(
      results
    )

      ? results

      : []

  /* ==========================================================================
  🔥 Collection Metadata
  ========================================================================== */

  const total =

    rankingRuntime?.total
    || rankingResults.length
    || 0

  const page =

    rankingRuntime?.page
    || 1

  const limit =

    rankingRuntime?.limit
    || rankingResults.length
    || 0

  const hasResults =

    rankingResults.length > 0

  /* ==========================================================================
  🔥 Result Preview
  ========================================================================== */

  const previewResults =

    rankingResults.slice(0, 5)

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '📊 RANKING COLLECTION INSPECTOR',

    {

      total,

      page,

      limit,

      results:

        rankingResults.length,

      preview:

        previewResults.length,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="📊 Ranking Collection Inspector"

      description="Collection runtime observability and semantic ranking topology visualization."

      badge="runtime/ranking-collection"

    >

      {/* ================================================================
      🔥 Collection Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="results"

          value={
            String(
              rankingResults.length
            )
          }

          variant={
            hasResults
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="page"

          value={
            String(page)
          }

          variant="topology"

        />

        <RuntimeBadge

          label="limit"

          value={
            String(limit)
          }

          variant="default"

        />

      </div>

      {/* ================================================================
      🔥 Collection Grid
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <InspectorCard

          title="Total Results"

          value={total}

        />

        <InspectorCard

          title="Current Page"

          value={page}

        />

        <InspectorCard

          title="Page Limit"

          value={limit}

        />

        <InspectorCard

          title="Loaded Results"

          value={rankingResults.length}

        />

      </div>

      {/* ================================================================
      🔥 Collection Preview
      ================================================================ */}

      <div className="rounded-2xl border border-zinc-800 bg-black p-6">

        <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">

          Collection Preview

        </div>

        {

          previewResults.length > 0

            ? (

                <div className="mt-4 space-y-3">

                  {

                    previewResults.map(

                      (

                        item: any,

                        index: number

                      ) => {

                        const title =

                          item?.title
                          || item?.name
                          || item?.product_name
                          || item?.product_title
                          || `ranking-item-${index + 1}`

                        const score =

                          item?.semantic_score
                          || item?.score
                          || '-'

                        const uniqueId =

                          item?.unique_id
                          || item?.uniqueId
                          || '-'

                        return (

                          <div

                            key={index}

                            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"

                          >

                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">

                              <div>

                                <div className="text-sm font-semibold text-zinc-100">

                                  {title}

                                </div>

                                <div className="mt-1 text-xs text-zinc-500">

                                  {uniqueId}

                                </div>

                              </div>

                              <RuntimeBadge

                                label="score"

                                value={
                                  String(score)
                                }

                                variant="semantic"

                              />

                            </div>

                          </div>
                        )
                      }
                    )
                  }

                </div>
              )

            : (

                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-500">

                  No ranking collection results detected.

                </div>
              )
        }

      </div>

      {/* ================================================================
      🔥 Raw Ranking Collection
      ================================================================ */}

      <RawJsonInspector

        title="Raw Ranking Collection"

        description="Raw ranking collection payload observability and collection topology inspection."

        badge="runtime/ranking-collection-raw"

        payload={

          {

            ranking:
              rankingRuntime,

            results:
              rankingResults,
          }
        }

      />

    </InspectorSection>
  )
}