// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/DiscoveryCardGrid.tsx
// ============================================================================

'use client'

import styles from '../styles/discovery-grid.module.css'

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

      <div className={styles.discoveryHeader}>

        <div>

          <div className={styles.discoveryEyebrow}>

            HIGH RELEVANCE DISCOVERY

          </div>

          <h2 className={styles.discoveryTitle}>

            注目のランキングモデル

          </h2>

          <p className={styles.discoveryDescription}>

            semantic runtime が高い関連性を検出した
            discovery nodes。

          </p>

        </div>

        <div className={styles.discoveryCount}>

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