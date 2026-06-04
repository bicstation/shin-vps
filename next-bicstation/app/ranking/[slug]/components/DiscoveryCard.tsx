// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/ranking/[slug]/components/DiscoveryCard.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../styles/discovery-grid.module.css'

import {
  ProductSemanticChips,
} from './'

type Props = {
  product?: any
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
  🔥 Empty
  ========================================================================== */

  if (!product) {

    return null
  }

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
        styles.discoveryCard
      }
    >

      {/* ================================================================
      Glow
      ================================================================ */}

      <div
        className={
          styles.discoveryGlow
        }
      />

      {/* ================================================================
      Rank
      ================================================================ */}

      <div
        className={
          styles.discoveryRank
        }
      >

        #{rank}

      </div>

      {/* ================================================================
      Visual
      ================================================================ */}

      <div
        className={
          styles.discoveryVisual
        }
      >

        {product?.image_url ? (

          <img
            src={product.image_url}
            alt={product?.name}
            className={
              styles.discoveryImage
            }
          />

        ) : (

          <div
            className={
              styles.discoveryImagePlaceholder
            }
          >

            NO IMAGE

          </div>

        )}

      </div>

      {/* ================================================================
      Content
      ================================================================ */}

      <div
        className={
          styles.discoveryContent
        }
      >

        {/* ============================================================
        Semantic Role
        ============================================================ */}

        {product?.semantic_role && (

          <div
            className={
              styles.discoveryRole
            }
          >

            {product.semantic_role}

          </div>

        )}

        {/* ============================================================
        Product Name
        ============================================================ */}

        <h3
          className={
            styles.discoveryTitle
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
              styles.discoveryMaker
            }
          >

            {product.maker}

          </div>

        )}

        {/* ============================================================
        Description
        ============================================================ */}

        {recommendationReason && (

          <p
            className={
              styles.discoveryDescription
            }
          >

            {recommendationReason}

          </p>

        )}

        {/* ============================================================
        Semantic Chips
        ============================================================ */}

        <div
          className={
            styles.discoveryChips
          }
        >

          <ProductSemanticChips
            groupedAttributes={
              groupedAttributes
            }
          />

        </div>

        {/* ============================================================
        Bottom
        ============================================================ */}

        <div
          className={
            styles.discoveryBottom
          }
        >

          {/* ========================================================
          Price
          ======================================================== */}

          {product?.price && (

            <div
              className={
                styles.discoveryPrice
              }
            >

              ¥
              {Number(
                product.price
              ).toLocaleString()}

            </div>

          )}

          {/* ========================================================
          Actions
          ======================================================== */}

          <div
            className={
              styles.discoveryActions
            }
          >

            {/* ====================================================
            Internal Runtime
            ==================================================== */}

            <Link
              href={
                productUniqueId
                  ? `/product/${productUniqueId}`
                  : '#'
              }
              className={
                styles.discoverySecondaryCTA
              }
            >

              詳細を見る

            </Link>

            {/* ====================================================
            External Shop
            ==================================================== */}

            <Link
              href={
                product?.affiliate_url || '#'
              }
              target="_blank"
              className={
                styles.discoveryCTA
              }
            >

              ショップへ

            </Link>

          </div>

        </div>

      </div>

    </article>

  )
}