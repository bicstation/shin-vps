// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/ranking/[slug]/components/ExplorationListItem.tsx
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

  const productUniqueId =
    product?.unique_id

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <article
      className={
        styles.explorationItem
      }
    >

      {/* ================================================================
      Rank
      ================================================================ */}

      <div
        className={
          styles.explorationRank
        }
      >

        #{rank}

      </div>

      {/* ================================================================
      Header
      ================================================================ */}

      <div
        className={
          styles.explorationHeader
        }
      >

        {/* ============================================================
        Product Title
        ============================================================ */}

        <h3
          className={
            styles.explorationProductTitle
          }
        >

          {product?.name}

        </h3>

        {/* ============================================================
        Maker
        ============================================================ */}

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

      {/* ================================================================
      Body
      ================================================================ */}

      <div
        className={
          styles.explorationBody
        }
      >

        {/* ============================================================
        Image Area
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
        Semantic Area
        ============================================================ */}

        <div
          className={
            styles.explorationSemantic
          }
        >

          {/* ========================================================
          Recommendation
          ======================================================== */}

          {recommendationReason && (

            <p
              className={
                styles.explorationReason
              }
            >

              {recommendationReason}

            </p>

          )}

          {/* ========================================================
          Semantic Chips
          ======================================================== */}

          <ProductSemanticChips
            groupedAttributes={
              groupedAttributes
            }
          />

        </div>

      </div>

      {/* ================================================================
      Footer
      ================================================================ */}

      <div
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

          {/* ========================================================
          Internal Runtime
          ======================================================== */}

          <Link
            href={
              productUniqueId
                ? `/product/${productUniqueId}`
                : '#'
            }
            className={
              styles.explorationSecondaryCTA
            }
          >

            詳細を見る

          </Link>

          {/* ========================================================
          External Shop
          ======================================================== */}

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

      </div>

    </article>

  )
}