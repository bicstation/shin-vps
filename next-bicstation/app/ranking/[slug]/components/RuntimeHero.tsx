// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeHero.tsx
// ============================================================================

'use client'

import styles from '../styles/runtime.module.css'

type Props = {

  seo?: {

    title?: string

    description?: string
  }

  totalProducts?: number
}

/* ============================================================================
🔥 Runtime Hero
============================================================================ */

export default function RuntimeHero({
  seo,
  totalProducts,
}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const title =
    seo?.title

  const description =
    seo?.description

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className={styles.runtimeHero}>

      {/* ================================================================
      Background Effects
      ================================================================ */}

      <div className={styles.runtimeHeroNoise} />

      <div className={styles.runtimeHeroGlow} />

      <div className={styles.runtimeHeroGrid} />

      <div className={styles.runtimeHeroGradient} />

      {/* ================================================================
      Inner
      ================================================================ */}

      <div className={styles.runtimeHeroInner}>

        {/* ============================================================
        Top
        ============================================================ */}

        <div className={styles.runtimeHeroTop}>

          {/* Badge */}

          <div
            className={
              styles.runtimeHeroBadge
            }
          >

            SHIN CORE LINX

          </div>

          {/* Runtime Status */}

          <div
            className={
              styles.runtimeHeroRuntime
            }
          >

            SEMANTIC DISCOVERY ACTIVE

          </div>

        </div>

        {/* ============================================================
        Eyebrow
        ============================================================ */}

        <div
          className={
            styles.runtimeHeroEyebrow
          }
        >

          CINEMATIC SEMANTIC RUNTIME

        </div>

        {/* ============================================================
        Title
        ============================================================ */}

        <h1
          className={
            styles.runtimeHeroTitle
          }
        >

          {title}

        </h1>

        {/* ============================================================
        Description
        ============================================================ */}

        {description && (

          <p
            className={
              styles.runtimeHeroDescription
            }
          >

            {description}

          </p>

        )}

        {/* ============================================================
        Discovery Metrics
        ============================================================ */}

        <div
          className={
            styles.runtimeHeroMetrics
          }
        >

          {/* Products */}

          <div
            className={
              styles.runtimeHeroMetric
            }
          >

            <div
              className={
                styles.runtimeHeroMetricLabel
              }
            >

              DISCOVERED PRODUCTS

            </div>

            <div
              className={
                styles.runtimeHeroMetricValue
              }
            >

              {totalProducts || 0}

            </div>

          </div>

          {/* Runtime */}

          <div
            className={
              styles.runtimeHeroMetric
            }
          >

            <div
              className={
                styles.runtimeHeroMetricLabel
              }
            >

              SEMANTIC MODE

            </div>

            <div
              className={
                styles.runtimeHeroMetricValue
              }
            >

              ACTIVE

            </div>

          </div>

          {/* Runtime Type */}

          <div
            className={
              styles.runtimeHeroMetric
            }
          >

            <div
              className={
                styles.runtimeHeroMetricLabel
              }
            >

              EXPERIENCE

            </div>

            <div
              className={
                styles.runtimeHeroMetricValue
              }
            >

              DISCOVERY

            </div>

          </div>

        </div>

        {/* ============================================================
        Semantic Chips
        ============================================================ */}

        <div
          className={
            styles.runtimeHeroChips
          }
        >

          <div
            className={
              styles.runtimeHeroChip
            }
          >

            Gaming

          </div>

          <div
            className={
              styles.runtimeHeroChip
            }
          >

            AI

          </div>

          <div
            className={
              styles.runtimeHeroChip
            }
          >

            Creator

          </div>

          <div
            className={
              styles.runtimeHeroChip
            }
          >

            High Performance

          </div>

        </div>

      </div>

    </section>

  )
}