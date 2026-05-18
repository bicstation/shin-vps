// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/debug/RuntimeDebugInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Runtime Debug Inspector
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic runtime inspection UI
 *   - frontend runtime visibility tooling
 *   - backend authority debug visualization
 *
 * IMPORTANT:
 *   - debug mode is inspection only
 *   - semantic meaning authority remains backend
 *
 * ============================================================================
 */

import styles from '../../styles/debug.module.css'

import workflowCopy from '../../translation/workflowCopy'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  data?: unknown

  title?: string
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function RuntimeDebugInspector({

  data,

  title,

}: Props) {

  /* ==========================================================================
  🔥 Copy
  ========================================================================== */

  const debugTitle =
    title
    ||

    workflowCopy
      .debugCopy
      .title

  const debugDescription =
    workflowCopy
      .debugCopy
      .description

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className={styles.debug}>

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.debugHeader}>

        <div className={styles.debugEyebrow}>

          {
            workflowCopy
              .debugCopy
              .eyebrow
          }

        </div>

        <h2 className={styles.debugTitle}>

          {debugTitle}

        </h2>

        <p className={styles.debugDescription}>

          {debugDescription}

        </p>

      </div>

      {/* ================================================================
      JSON
      ================================================================ */}

      <pre className={styles.debugPre}>

        {JSON.stringify(
          data,
          null,
          2
        )}

      </pre>

    </section>

  )
}