// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/shelves/SemanticShelf.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Semantic Shelf
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic discovery shelf renderer
 *   - workflow-oriented runtime section
 *   - cinematic exploration continuity
 *
 * IMPORTANT:
 *   - semantic authority belongs to backend
 *   - frontend orchestrates discovery UX only
 *
 * ============================================================================
 */

import styles from '../../styles/product-runtime.module.css'

import ShelfHeader from './ShelfHeader'

import HorizontalShelf from './HorizontalShelf'

import type {
  ShelfRuntime,
} from '../../types/runtime'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  shelf: ShelfRuntime
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function SemanticShelf({

  shelf,

}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const products =
    shelf?.products
    || []

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

    <section className={styles.shelf}>

      {/* ================================================================
      Header
      ================================================================ */}

      <ShelfHeader
        title={shelf.title}
        description={shelf.description}
      />

      {/* ================================================================
      Horizontal Shelf
      ================================================================ */}

      <HorizontalShelf
        products={products}
      />

    </section>

  )
}