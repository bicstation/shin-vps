// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/cards/ProductCardImage.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Product Card Image
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic discovery visual renderer
 *   - product identity visualization
 *   - lightweight runtime image component
 *
 * IMPORTANT:
 *   - frontend renders visual identity only
 *   - semantic meaning remains backend authority
 *
 * ============================================================================
 */

import styles from '../../styles/card.module.css'

import workflowCopy from '../../translation/workflowCopy'

import type {
  Product,
} from '../../types/product'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product: Product
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductCardImage({

  product,

}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const imageUrl =
    product?.image_url

  const title =
    product?.short_name
    ||
    product?.name
    ||
    'Product'

  /* ==========================================================================
  🔥 Placeholder
  ========================================================================== */

  const placeholder =
    workflowCopy
      .cardCopy
      .placeholder

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.cardImageArea}>

      {imageUrl ? (

        <img
          src={imageUrl}
          alt={title}
          className={styles.cardImage}
        />

      ) : (

        <div
          className={
            styles.cardPlaceholder
          }
        >

          {placeholder}

        </div>

      )}

    </div>

  )
}