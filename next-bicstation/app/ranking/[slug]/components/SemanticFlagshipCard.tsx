// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/SemanticFlagshipCard.tsx
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
🔥 Semantic Flagship Card
============================================================================ */

export default function SemanticFlagshipCard({
  product,
  rank = 1,
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

    <section className={styles.flagshipSection}>

      <article className={styles.flagshipCard}>

        {/* ================================================================
        Background Effects
        ================================================================ */}

        <div className={styles.flagshipGlow} />

        <div className={styles.flagshipNoise} />

        {/* ================================================================
        Rank Area
        ================================================================ */}

        <div className={styles.flagshipRankArea}>

          <div className={styles.flagshipRankLabel}>

            FLAGSHIP RUNTIME

          </div>

          <div className={styles.flagshipRank}>

            #{rank}

          </div>

        </div>

        {/* ================================================================
        Content
        ================================================================ */}

        <div className={styles.flagshipContent}>

          {/* ============================================================
          Left
          ============================================================ */}

          <div className={styles.flagshipLeft}>

            {/* Semantic */}
            <div className={styles.flagshipSemanticTop}>

              {semanticRole && (

                <div className={styles.flagshipRole}>

                  {semanticRole}

                </div>

              )}

              {semanticWeight && (

                <div className={styles.flagshipWeight}>

                  score {semanticWeight}

                </div>

              )}

            </div>

            {/* Title */}
            <h2 className={styles.flagshipTitle}>

              {product?.name}

            </h2>

            {/* Maker */}
            {product?.maker && (

              <div className={styles.flagshipMaker}>

                {product.maker}

              </div>

            )}

            {/* Recommendation */}
            {recommendationReason && (

              <p className={styles.flagshipReason}>

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

          {/* ============================================================
          Right
          ============================================================ */}

          <div className={styles.flagshipRight}>

            {/* Image */}
            <div className={styles.flagshipImageArea}>

              {product?.image_url ? (

                <img
                  src={product.image_url}
                  alt={product?.name}
                  className={
                    styles.flagshipImage
                  }
                />

              ) : (

                <div
                  className={
                    styles.flagshipImagePlaceholder
                  }
                >

                  NO IMAGE

                </div>

              )}

            </div>

            {/* Price */}
            {product?.price && (

              <div className={styles.flagshipPrice}>

                ¥
                {Number(
                  product.price
                ).toLocaleString()}

              </div>

            )}

            {/* CTA */}
            <Link
              href={
                product?.affiliate_url
                || '#'
              }
              target="_blank"
              className={
                styles.flagshipCTA
              }
            >

              詳細を見る

            </Link>

          </div>

        </div>

      </article>

    </section>

  )
}