// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/shelves/ShelfControls.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Shelf Controls
 * ============================================================================
 *
 * PURPOSE:
 *   - horizontal shelf navigation controls
 *   - desktop runtime exploration UX
 *   - cinematic shelf interaction layer
 *
 * IMPORTANT:
 *   - controls affect presentation only
 *   - semantic authority remains backend
 *
 * ============================================================================
 */

import styles from '../../styles/product-runtime.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  onLeft?: () => void

  onRight?: () => void
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ShelfControls({

  onLeft,

  onRight,

}: Props) {

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.shelfControls}>

      {/* ================================================================
      Left
      ================================================================ */}

      <button
        type="button"
        className={styles.shelfButton}
        onClick={onLeft}
      >

        ←

      </button>

      {/* ================================================================
      Right
      ================================================================ */}

      <button
        type="button"
        className={styles.shelfButton}
        onClick={onRight}
      >

        →

      </button>

    </div>

  )
}