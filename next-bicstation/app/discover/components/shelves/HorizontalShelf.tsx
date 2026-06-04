// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/shelves/HorizontalShelf.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Horizontal Shelf
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic shelf horizontal runtime renderer
 *   - mobile-first discovery scrolling UX
 *   - cinematic shelf continuity
 *
 * IMPORTANT:
 *   - semantic authority remains backend
 *   - frontend orchestrates exploration flow only
 *
 * ============================================================================
 */

import {
  useRef,
} from 'react'

import styles from '../../styles/product-runtime.module.css'

import ProductCard from '../cards/ProductCard'

import type {
  Product,
} from '../../types/product'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  products?: Product[]
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function HorizontalShelf({

  products = [],

}: Props) {

  /* ==========================================================================
  🔥 Ref
  ========================================================================== */

  const shelfRef =
    useRef<HTMLDivElement | null>(
      null
    )

  /* ==========================================================================
  🔥 Scroll
  ========================================================================== */

  function scrollShelf(

    direction:
      'left'
      | 'right'

  ) {

    if (!shelfRef.current) {

      return
    }

    shelfRef.current.scrollBy({

      left:
        direction === 'left'
          ? -1200
          : 1200,

      behavior:
        'smooth',
    })
  }

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!products.length) {

    return null
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.shelfRuntime}>

      {/* ================================================================
      Controls
      ================================================================ */}

      <div className={styles.shelfControls}>

        <button
          className={styles.shelfButton}
          onClick={() =>
            scrollShelf(
              'left'
            )
          }
        >

          ←

        </button>

        <button
          className={styles.shelfButton}
          onClick={() =>
            scrollShelf(
              'right'
            )
          }
        >

          →

        </button>

      </div>

      {/* ================================================================
      Shelf
      ================================================================ */}

      <div
        ref={shelfRef}
        className={styles.horizontalShelf}
      >

        {products.map(
          (
            product,
            index
          ) => (

            <ProductCard
              key={
                product?.unique_id
                || index
              }
              product={product}
            />

          )
        )}

      </div>

    </div>

  )
}