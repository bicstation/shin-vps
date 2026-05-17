// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/DiscoveryCard.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../RankingSlugPage.module.css'

import {
  ProductSemanticChips,
} from './'

type Props = {
  product: any
  rank?: number
}

/* ============================================================================
🔥 Discovery Card
============================================================================ */

export default function DiscoveryCard({
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

  const semanticWeight =
    product?.semantic_weight

  const semanticRole =
    product?.semantic_role

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <article className={styles.discoveryCard}>

      {/* ================================================================
      Glow
      ================================================================ */}

      <div className={styles.discoveryCardGlow} />

      {/* ================================================================
      Rank
      ================================================================ */}

      {rank && (

        <div className={styles.discoveryRank}>

          #{rank}

        </div>

      )}

      {/* ================================================================
      Image
      ================================================================ */}

      <div className={styles.discoveryImageArea}>

        {product?.image_url ? (

          <img
            src={product.image_url}
            alt={product.name}
            className={styles.discoveryImage}
          />

        ) : (

          <div className={styles.discoveryImagePlaceholder}>

            NO IMAGE

          </div>

        )}

      </div>

      {/* ================================================================
      Content
      ================================================================ */}

      <div className={styles.discoveryContent}>

        {/* ============================================================
        Top
        ============================================================ */}

        <div className={styles.discoveryTop}>

          {semanticRole && (

            <div className={styles.discoveryRole}>

              {semanticRole}

            </div>

          )}

          {semanticWeight && (

            <div className={styles.discoveryWeight}>

              score {semanticWeight}

            </div>

          )}

        </div>

        {/* ============================================================
        Product Name
        ============================================================ */}

        <h3 className={styles.discoveryTitle}>

          {product?.name}

        </h3>

        {/* ============================================================
        Maker
        ============================================================ */}

        {product?.maker && (

          <div className={styles.discoveryMaker}>

            {product.maker}

          </div>

        )}

        {/* ============================================================
        Price
        ============================================================ */}

        {product?.price && (

          <div className={styles.discoveryPrice}>

            ¥
            {Number(
              product.price
            ).toLocaleString()}

          </div>

        )}

        {/* ============================================================
        Recommendation Reason
        ============================================================ */}

        {recommendationReason && (

          <p className={styles.discoveryReason}>

            {recommendationReason}

          </p>

        )}

        {/* ============================================================
        Semantic Chips
        ============================================================ */}

        <ProductSemanticChips
          groupedAttributes={
            groupedAttributes
          }
        />

      </div>

      {/* ================================================================
      Footer
      ================================================================ */}

      <div className={styles.discoveryFooter}>

        <Link
          href={product?.affiliate_url || '#'}
          target="_blank"
          className={styles.discoveryCTA}
        >

          詳細を見る

        </Link>

      </div>

    </article>

  )
}