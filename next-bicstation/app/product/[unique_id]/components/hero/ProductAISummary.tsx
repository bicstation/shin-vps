// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductAISummary.tsx
//
// SHIN CORE LINX
// Product Semantic Understanding
//
// RESPONSIBILITY
//
// Product
//        +
// Product Semantic Runtime
//        ↓
// ProductAISummary
//        ↓
// "{product.name} は、どんなPC？"
//
// ProductAISummary = Semantic Understanding Experience
//
// ✓ Displays Backend-derived semanticSummary
// ✓ Displays Product Identity
// ✓ Handles empty / unavailable semantic data
// ✓ Presents semantic understanding clearly
// ✓ Provides a stable section anchor
//
// ✗ Semantic generation
// ✗ AI inference
// ✗ Product classification
// ✗ Workflow inference
// ✗ Recommendation generation
// ✗ Runtime generation
//
// ============================================================================


/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './styles/ProductAISummary.module.css'


/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

  semanticRuntime?:
    ProjectedSemanticRuntime

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductAISummary({

  product,

  semanticRuntime,

}: Props) {


  /* ==========================================================================
  Product Identity
  ========================================================================== */

  const productName =

    product?.name
      ?.trim()
    ||
    'このPC'


  /* ==========================================================================
  Semantic Observation
  ========================================================================== */

  const summary =

    semanticRuntime
      ?.semanticSummary
      ?.trim()
    ||
    ''


  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (!summary) {

    return null

  }


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section

      className={
        styles.aiSummary
      }

      id="product-understanding"

      aria-labelledby="product-semantic-summary-title"

    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div
        className={
          styles.aiSummaryHeader
        }
      >

        {/* ====================================================================
        LABEL
        ==================================================================== */}

        <div
          className={
            styles.aiSummaryLabel
          }
        >

          PRODUCT UNDERSTANDING

        </div>


        {/* ====================================================================
        TITLE
        ==================================================================== */}

        <h2

          id="product-semantic-summary-title"

          className={
            styles.aiSummaryTitle
          }

        >

          {productName}
          は、どんなPC？

        </h2>


        {/* ====================================================================
        DESCRIPTION
        ==================================================================== */}

        <p
          className={
            styles.aiSummaryDescription
          }
        >

          {productName}
          の特徴や位置づけを、
          わかりやすく整理しています。

        </p>

      </div>


      {/* ======================================================================
      SUMMARY
      ====================================================================== */}

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