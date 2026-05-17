// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/ExplorationListItem.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../styles/exploration-list.module.css'

import {
  ProductSemanticChips,
} from './'

type Props = {
  product: any
  rank?: number
}

/* ============================================================================
🔥 Exploration List Item
============================================================================ */

export default function ExplorationListItem({
  product,
  rank,
}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const groupedAttributes =
    product?.grouped_attributes || {}

  const recommendationReason =
    product?.recommendation_reason

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <article className={styles.explorationItem}>

      {/* ================================================================
      Rank
      ================================================================ */}

      <div className={styles.explorationRank}>

        #{rank}

      </div>

      {/* ================================================================
      Image
      ================================================================ */}

      <div className={styles.explorationImageArea}>

        {product?.image_url ? (

          <img
            src={product.image_url}
            alt={product?.name}
            className={styles.explorationImage}
          />

        ) : (

          <div className={styles.explorationImagePlaceholder}>

            NO IMAGE

          </div>

        )}

      </div>

      {/* ================================================================
      Content
      ================================================================ */}

      <div className={styles.explorationContent}>

        {/* Product Name */}
        <h3 className={styles.explorationProductTitle}>

          {product?.name}

        </h3>

        {/* Maker */}
        {product?.maker && (

          <div className={styles.explorationMaker}>

            {product.maker}

          </div>

        )}

        {/* Recommendation */}
        {recommendationReason && (

          <p className={styles.explorationReason}>

            {recommendationReason}

          </p>

        )}

        {/* Semantic Chips */}
        <ProductSemanticChips
          groupedAttributes={
            groupedAttributes
          }
        />

      </div>

      {/* ================================================================
      Price Area
      ================================================================ */}

      <div className={styles.explorationSide}>

        {/* Price */}
        {product?.price && (

          <div className={styles.explorationPrice}>

            ¥
            {Number(
              product.price
            ).toLocaleString()}

          </div>

        )}

        {/* CTA */}
        <Link
          href={product?.affiliate_url || '#'}
          target="_blank"
          className={styles.explorationCTA}
        >

          詳細を見る

        </Link>

      </div>

    </article>

  )
}