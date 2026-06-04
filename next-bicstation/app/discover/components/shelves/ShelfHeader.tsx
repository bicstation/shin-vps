// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/shelves/ShelfHeader.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Shelf Header
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic shelf title renderer
 *   - workflow-oriented discovery header
 *   - cinematic hierarchy presentation
 *
 * IMPORTANT:
 *   - semantic authority belongs to backend
 *   - frontend translates hierarchy only
 *
 * ============================================================================
 */

import styles from '../../styles/product-runtime.module.css'

import workflowCopy from '../../translation/workflowCopy'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  title?: string

  description?: string
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ShelfHeader({

  title,

  description,

}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const eyebrow =
    workflowCopy
      .shelfCopy
      .eyebrow

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.shelfHeader}>

      <div>

        {/* ================================================================
        Eyebrow
        ================================================================ */}

        <div className={styles.shelfEyebrow}>

          {eyebrow}

        </div>

        {/* ================================================================
        Title
        ================================================================ */}

        <h2 className={styles.shelfTitle}>

          {title}

        </h2>

        {/* ================================================================
        Description
        ================================================================ */}

        <p className={styles.shelfDescription}>

          {description}

        </p>

      </div>

    </div>

  )
}