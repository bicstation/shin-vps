// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/ExplorationList.tsx
// ============================================================================

'use client'

import styles from '../RankingSlugPage.module.css'

import {
  ExplorationListItem,
} from './'

type Props = {
  products?: any[]
  startRank?: number
}

/* ============================================================================
🔥 Exploration List
============================================================================ */

export default function ExplorationList({
  products = [],
  startRank = 1,
}: Props) {

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

    <section className={styles.explorationSection}>

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.explorationHeader}>

        <div>

          <div className={styles.explorationEyebrow}>

            SEMANTIC EXPLORATION FLOW

          </div>

          <h2 className={styles.explorationTitle}>

            さらに探索する

          </h2>

        </div>

        <div className={styles.explorationCount}>

          {products.length}
          {' '}
          models

        </div>

      </div>

      {/* ================================================================
      List
      ================================================================ */}

      <div className={styles.explorationList}>

        {products.map(
          (
            product,
            index
          ) => (

            <ExplorationListItem
              key={
                product?.id
                ||
                product?.slug
                ||
                index
              }
              product={product}
              rank={
                startRank + index
              }
            />

          )
        )}

      </div>

    </section>

  )
}