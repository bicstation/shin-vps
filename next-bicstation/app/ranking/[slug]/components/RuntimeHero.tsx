// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeHero.tsx
// ============================================================================

'use client'

import styles from '../RankingSlugPage.module.css'

type Props = {
  seo?: {
    title?: string
    description?: string
  }
}

/* ============================================================================
🔥 Runtime Hero
============================================================================ */

export default function RuntimeHero({
  seo,
}: Props) {

  return (

    <section className={styles.runtimeHero}>

      {/* ================================================================
      Background Effects
      ================================================================ */}

      <div className={styles.runtimeHeroNoise} />

      <div className={styles.runtimeHeroGlow} />

      <div className={styles.runtimeHeroGrid} />

      {/* ================================================================
      Inner
      ================================================================ */}

      <div className={styles.runtimeHeroInner}>

        {/* Badge */}
        <div className={styles.runtimeHeroBadge}>

          SHIN CORE LINX

        </div>

        {/* Eyebrow */}
        <div className={styles.runtimeHeroEyebrow}>

          SEMANTIC DISCOVERY RUNTIME

        </div>

        {/* Title */}
        <h1 className={styles.runtimeHeroTitle}>

          {seo?.title}

        </h1>

        {/* Description */}
        {seo?.description && (

          <p className={styles.runtimeHeroDescription}>

            {seo.description}

          </p>

        )}

      </div>

    </section>

  )
}