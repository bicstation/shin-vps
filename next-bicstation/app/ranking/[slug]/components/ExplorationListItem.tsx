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

  const productSlug =
    product?.slug

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <article className={styles.explorationItem}>

      {/* ================================================================
      Glow
      ================================================================ */}

      <div
        className={
          styles.explorationGlow
        }
      />

      {/* ================================================================
      Header
      ================================================================ */}

      <header
        className={
          styles.explorationHeaderArea
        }
      >

        {/* Rank */}

        <div
          className={
            styles.explorationRank
          }
        >

          #{rank}

        </div>

        {/* Title Area */}

        <div
          className={
            styles.explorationTitleArea
          }
        >

          {/* Product Name */}

          <h3
            className={
              styles.explorationProductTitle
            }
          >

            {product?.name}

          </h3>

          {/* Maker */}

          {product?.maker && (

            <div
              className={
                styles.explorationMaker
              }
            >

              {product.maker}

            </div>

          )}

        </div>

      </header>

      {/* ================================================================
      Body
      ================================================================ */}

      <div
        className={
          styles.explorationBody
        }
      >

        {/* ============================================================
        Image
        ============================================================ */}

        <div
          className={
            styles.explorationImageArea
          }
        >

          {product?.image_url ? (

            <img
              src={product.image_url}
              alt={product?.name}
              className={
                styles.explorationImage
              }
            />

          ) : (

            <div
              className={
                styles.explorationImagePlaceholder
              }
            >

              NO IMAGE

            </div>

          )}

        </div>

        {/* ============================================================
        Content
        ============================================================ */}

        <div
          className={
            styles.explorationContent
          }
        >

          {/* Recommendation */}

          {recommendationReason && (

            <p
              className={
                styles.explorationReason
              }
            >

              {recommendationReason}

            </p>

          )}

          {/* Semantic Chips */}

          <div
            className={
              styles.explorationChips
            }
          >

            <ProductSemanticChips
              groupedAttributes={
                groupedAttributes
              }
            />

          </div>

        </div>

      </div>

      {/* ================================================================
      Footer
      ================================================================ */}

      <footer
        className={
          styles.explorationFooter
        }
      >

        {/* ============================================================
        Price
        ============================================================ */}

        {product?.price && (

          <div
            className={
              styles.explorationPrice
            }
          >

            ¥
            {Number(
              product.price
            ).toLocaleString()}

          </div>

        )}

        {/* ============================================================
        Actions
        ============================================================ */}

        <div
          className={
            styles.explorationActions
          }
        >

          {/* Internal */}

          <Link
            href={
              productSlug
                ? `/products/${productSlug}`
                : '#'
            }
            className={
              styles.explorationSecondaryCTA
            }
          >

            詳細を見る

          </Link>

          {/* Affiliate */}

          <Link
            href={
              product?.affiliate_url || '#'
            }
            target="_blank"
            className={
              styles.explorationCTA
            }
          >

            ショップへ

          </Link>

        </div>

      </footer>

    </article>

  )
}