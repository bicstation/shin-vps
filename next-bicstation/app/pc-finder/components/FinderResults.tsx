'use client'

/* =========================================
🔥 Components
========================================= */

import FinderResultCard
  from './FinderResultCard'

/* =========================================
🔥 Styles
========================================= */

import styles
  from '../styles/pcFinder.module.css'

/* =========================================
🔥 Helpers
========================================= */

import {
  normalizeFinderProducts,
} from '../lib/finderHelpers'

/* =========================================
🔥 Props
========================================= */

type Props = {

  results: any[]
}

/* =========================================
🔥 Finder Results
========================================= */

export default function
FinderResults({

  results,

}: Props) {

  // ======================================
  // Normalize
  // ======================================

  const normalizedResults =

    normalizeFinderProducts(
      results
    )

  // ======================================
  // Empty
  // ======================================

  if (
    !normalizedResults.length
  ) {

    return null
  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 FinderResults',
    {

      resultCount:
        normalizedResults.length,

      firstResult:

        normalizedResults?.[0]
        ? {

            unique_id:
              normalizedResults[0]
                ?.unique_id,

            name:
              normalizedResults[0]
                ?.name,

          }

        : null,

    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.resultsSection
      }
    >

      {/* ==================================
      Header
      ================================== */}

      <div
        className={
          styles.resultsHeader
        }
      >

        {/* ============================= */}
        {/* Label */}
        {/* ============================= */}

        <div
          className={
            styles.resultsLabel
          }
        >

          SEMANTIC RESULTS

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h2
          className={
            styles.resultsTitle
          }
        >

          おすすめPC一覧

        </h2>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.resultsDescription
          }
        >

          semantic recommendation /
          workload analysis /
          recommendation score
          に基づく最適化結果。

        </p>

      </div>

      {/* ==================================
      Grid
      ================================== */}

      <div
        className={
          styles.resultGrid
        }
      >

        {normalizedResults.map(
          (
            item: any,
            index: number
          ) => (

            <FinderResultCard

              key={
                item.unique_id
              }

              product={
                item
              }

              index={
                index
              }

            />

          )
        )}

      </div>

    </section>
  )
}