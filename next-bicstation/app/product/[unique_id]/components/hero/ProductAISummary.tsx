// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductAISummary.tsx
// ============================================================================

import styles
  from './styles/ProductAISummary.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  semanticRuntime?: {

    semantic_summary?: string

  }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductAISummary({

  semanticRuntime,

}: Props) {

  const summary =

    semanticRuntime
      ?.semantic_summary

    ||

    ''

  if (!summary) {

    return null

  }

  return (

    <section
      className={
        styles.aiSummary
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.aiSummaryHeader
        }
      >

        <div
          className={
            styles.aiSummaryLabel
          }
        >
          PRODUCT SUMMARY
        </div>

        <h2
          className={
            styles.aiSummaryTitle
          }
        >
          この製品はどんなPC？
        </h2>

      </div>

      {/* ==========================================================
      SUMMARY
      ========================================================== */}

      <div
        className={
          styles.aiSummaryBlock
        }
      >

        <p
          className={
            styles.aiSummaryText
          }
        >
          {summary}
        </p>

      </div>

    </section>

  )

}