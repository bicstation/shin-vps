// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingTabs.tsx
// ============================================================================

'use client'

import styles from '../RankingPage.module.css'

import {
  PRESENTATION_COPY,
} from '../lib/presentationCopy'

type Props = {
  groupedAttributes: any
  groupKeys: string[]
  activeGroup: string | null
  onChangeGroup: (
    groupKey: string
  ) => void
}

/* ============================================================================
🔥 Hero Semantic Groups
============================================================================ */

const HERO_GROUPS = [
  'gpu',
  'cpu',
  'usage',
]

/* ============================================================================
🔥 Ranking Tabs
============================================================================ */

export default function RankingTabs({
  groupedAttributes,
  groupKeys,
  activeGroup,
  onChangeGroup,
}: Props) {

  /* ==========================================================================
  🔥 Semantic Hierarchy
  ========================================================================== */

  const heroGroups =
    groupKeys.filter(
      (groupKey) =>
        HERO_GROUPS.includes(groupKey)
    )

  const normalGroups =
    groupKeys.filter(
      (groupKey) =>
        !HERO_GROUPS.includes(groupKey)
    )

  return (

    <section className={styles.tabSection}>

      <div className={styles.tabWrapper}>

        {/* ================================================================
        HERO TABS
        ================================================================ */}

        <div className={styles.heroTabGrid}>

          {heroGroups.map((groupKey) => {

            const group =
              groupedAttributes[groupKey]

            const meta =
              group?.meta || {}

            const presentation =
              PRESENTATION_COPY[groupKey]

            const isActive =
              activeGroup === groupKey

            return (

              <button
                key={groupKey}
                onClick={() =>
                  onChangeGroup(groupKey)
                }
                className={`
                  ${styles.heroTab}
                  ${isActive
                    ? styles.heroTabActive
                    : ''
                  }
                `}
              >

                {/* Glow */}
                <div className={styles.heroTabGlow} />

                {/* Inner */}
                <div className={styles.heroTabInner}>

                  {/* Label */}
                  <div className={styles.heroTabLabel}>

                    {meta.name}

                  </div>

                  {/* Title */}
                  <div className={styles.heroTabTitle}>

                    {presentation?.title
                      || meta.name}

                  </div>

                  {/* Description */}
                  <div className={styles.heroTabDescription}>

                    {presentation?.subtitle
                      || meta.description}

                  </div>

                </div>

              </button>

            )
          })}

        </div>

        {/* ================================================================
        NORMAL TABS
        ================================================================ */}

        <div className={styles.tabContainer}>

          {normalGroups.map((groupKey) => {

            const group =
              groupedAttributes[groupKey]

            const meta =
              group?.meta || {}

            const presentation =
              PRESENTATION_COPY[groupKey]

            const isActive =
              activeGroup === groupKey

            return (

              <button
                key={groupKey}
                onClick={() =>
                  onChangeGroup(groupKey)
                }
                className={`
                  ${styles.tabButton}
                  ${isActive
                    ? styles.tabButtonActive
                    : ''
                  }
                `}
              >

                {/* Name */}
                <div className={styles.tabName}>

                  {meta.name}

                </div>

                {/* Description */}
                <div className={styles.tabDescription}>

                  {presentation?.subtitle
                    || meta.description}

                </div>

              </button>

            )
          })}

        </div>

      </div>

    </section>

  )
}