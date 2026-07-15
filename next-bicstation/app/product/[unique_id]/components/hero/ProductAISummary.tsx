// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductAISummary.tsx
// ============================================================================

import styles
  from './styles/ProductAISummary.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  semanticRuntime?: ProjectedSemanticRuntime

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductAISummary({

  semanticRuntime,

}: Props) {

  const summary =

    semanticRuntime
      ?.semanticSummary

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
          これはどんなPC？
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