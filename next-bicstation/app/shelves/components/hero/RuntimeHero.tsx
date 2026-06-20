// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/hero/RuntimeHero.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Runtime Hero
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic runtime hero renderer
 *   - workflow-oriented discovery entry
 *   - cinematic runtime introduction
 *
 * IMPORTANT:
 *   - frontend translates discovery UX
 *   - semantic authority remains backend
 *
 * ============================================================================
 */

import styles from '../../styles/product-runtime.module.css'

import runtimeLayout from '../../orchestration/runtimeLayout'

/* ============================================================================
🔥 Component
============================================================================ */

export default function RuntimeHero() {

  /* ==========================================================================
  🔥 Hero Runtime
  ========================================================================== */

  const hero =
    runtimeLayout.hero

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className={styles.hero}>

      <div className={styles.heroInner}>

        {/* ================================================================
        Eyebrow
        ================================================================ */}

        <div className={styles.heroEyebrow}>

          {hero.eyebrow}

        </div>

        {/* ================================================================
        Title
        ================================================================ */}

        <h1 className={styles.heroTitle}>

          {hero.title}

        </h1>

        {/* ================================================================
        Description
        ================================================================ */}

        <p className={styles.heroDescription}>

          {hero.description}

        </p>

      </div>

    </section>

  )
}