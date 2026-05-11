// ResultsSection.tsx
'use client'

/* =========================================
🔥 Components
========================================= */

import FinderResults
  from '../../components/FinderResults'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './ResultsSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  results: any[]

  semanticUsage: string
}

/* =========================================
🔥 Results Section
========================================= */

export default function
ResultsSection({

  results,

  semanticUsage,

}: Props) {

  // ======================================
  // Safe
  // ======================================

  if (
    !Array.isArray(
      results
    )
    ||
    !results.length
  ) {

    return null

  }

  // ======================================
  // Top Result
  // ======================================

  const topResult =

    results?.[0]
    || null

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 ResultsSection',
    {

      semanticUsage,

      resultCount:
        results.length,

      firstResult:

        topResult
        ? {

            unique_id:
              topResult
                ?.unique_id,

            name:
              topResult
                ?.name,

            maker:
              topResult
                ?.maker,

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
        styles.section
      }
    >

      {/* ==================================
      Header
      ================================== */}

      <div
        className={
          styles.header
        }
      >

        {/* ============================= */}
        {/* Label */}
        {/* ============================= */}

        <div
          className={
            styles.label
          }
        >

          SEMANTIC RESULTS

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h2
          className={
            styles.title
          }
        >

          おすすめPC一覧

        </h2>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.description
          }
        >

          semantic recommendation /
          workload analysis /
          budget optimization
          に基づく推奨結果。

        </p>

      </div>

      {/* ==================================
      Semantic
      ================================== */}

      <div
        className={
          styles.semanticBox
        }
      >

        <div
          className={
            styles.semanticLabel
          }
        >

          ACTIVE SEMANTIC

        </div>

        <div
          className={
            styles.semanticValue
          }
        >

          {semanticUsage}

        </div>

      </div>

      {/* ==================================
      Results
      ================================== */}

      <div
        className={
          styles.results
        }
      >

        <FinderResults

          results={
            results
          }

        />

      </div>

    </section>

  )
}