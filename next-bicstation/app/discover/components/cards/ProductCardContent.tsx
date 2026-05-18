// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/cards/ProductCardContent.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Product Card Content
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic discovery content renderer
 *   - workflow-oriented product presentation
 *   - semantic metadata UX translation
 *
 * IMPORTANT:
 *   - backend owns semantic meaning
 *   - frontend translates discovery readability
 *
 * ============================================================================
 */

import styles from '../../styles/card.module.css'

import SemanticChips from './SemanticChips'

import type {
  Product,
} from '../../types/product'

/* ============================================================================
🔥 Product Card Content
============================================================================ */

type Props = {

  product: Product
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductCardContent({

  product,

}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const title =
    product?.short_name
    ||
    product?.name
    ||
    'Unknown Product'

  const recommendationReason =
    product?.recommendation_reason

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.cardContent}>

      {/* ================================================================
      Title
      ================================================================ */}

      <h3 className={styles.cardTitle}>

        {title}

      </h3>

      {/* ================================================================
      Recommendation Reason
      ================================================================ */}

      {recommendationReason && (

        <p className={styles.cardReason}>

          {recommendationReason}

        </p>

      )}

      {/* ================================================================
      Semantic Chips
      ================================================================ */}

      <SemanticChips
        groupedAttributes={
          product?.grouped_attributes
        }
      />

    </div>

  )
}