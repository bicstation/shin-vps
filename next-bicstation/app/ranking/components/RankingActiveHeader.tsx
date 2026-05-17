// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingActiveHeader.tsx
// ============================================================================

import styles from '../RankingPage.module.css'

type Props = {
  meta: {
    name?: string
    icon?: string
    semantic_role?: string
    description?: string
  }

  presentation?: {
    title?: string
    hero?: string
  }
}

/* ============================================================================
🔥 Ranking Active Header
============================================================================ */

export default function RankingActiveHeader({
  meta,
  presentation,
}: Props) {

  return (

    <section className={styles.activeSection}>

      <div className={styles.activeInner}>

        {/* Meta Row */}
        <div className={styles.activeMetaRow}>

          {meta?.icon && (
            <div className={styles.metaBadge}>
              {meta.icon}
            </div>
          )}

          {meta?.semantic_role && (
            <div className={styles.metaBadge}>
              {meta.semantic_role}
            </div>
          )}

        </div>

        {/* Title */}
        <h2 className={styles.activeTitle}>

          {presentation?.title
            || meta?.name}

        </h2>

        {/* Hero Text */}
        <p className={styles.activeHeroText}>

          {presentation?.hero
            || meta?.description}

        </p>

      </div>

    </section>

  )
}