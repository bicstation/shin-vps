// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/DiscoveryCardGrid.tsx
// ============================================================================

'use client'

import styles from '../RankingSlugPage.module.css'

import {
  DiscoveryCard,
} from './'

type Props = {
  products?: any[]
}

/* ============================================================================
🔥 Discovery Card Grid
============================================================================ */

export default function DiscoveryCardGrid({
  products = [],
}: Props) {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!products.length) {

    return (

      <section className={styles.discoverySection}>

        <div className={styles.discoveryEmpty}>

          discovery runtime data not found

        </div>

      </section>

    )
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className={styles.discoverySection}>

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.discoverySectionHeader}>

        <div>

          <div className={styles.discoveryEyebrow}>

            HIGH RELEVANCE DISCOVERY

          </div>

          <h2 className={styles.discoveryHeading}>

            注目のランキングモデル

          </h2>

        </div>

        <div className={styles.discoveryMeta}>

          {products.length}
          {' '}
          models

        </div>

      </div>

      {/* ================================================================
      Grid
      ================================================================ */}

      <div className={styles.discoveryGrid}>

        {products.map(
          (
            product,
            index
          ) => (

            <DiscoveryCard
              key={
                product?.id
                ||
                product?.slug
                ||
                index
              }
              product={product}
              rank={index + 1}
            />

          )
        )}

      </div>

    </section>

  )
}