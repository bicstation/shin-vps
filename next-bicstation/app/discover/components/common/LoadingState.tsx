// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/common/LoadingState.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Loading State
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic runtime loading renderer
 *   - lightweight runtime waiting state
 *   - cinematic discovery loading UX
 *
 * IMPORTANT:
 *   - loading state is presentation only
 *   - runtime authority remains backend
 *
 * ============================================================================
 */

import styles from '../../styles/product-runtime.module.css'

import workflowCopy from '../../translation/workflowCopy'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  message?: string
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function LoadingState({

  message,

}: Props) {

  /* ==========================================================================
  🔥 Copy
  ========================================================================== */

  const loadingMessage =
    message
    ||

    workflowCopy
      .shelfCopy
      .loading

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.loading}>

      {loadingMessage}

    </div>

  )
}