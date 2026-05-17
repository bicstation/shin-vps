// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/ranking/[slug]/components/SemanticFlagshipCard.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../styles/flagship.module.css'

import {
  ProductSemanticChips,
} from './'

type Props = {
  product?: any
}

/* ============================================================================
🔥 Semantic Flagship Card
============================================================================ */

export default function SemanticFlagshipCard({
  product,
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

    <section
      className={
        styles.flagship
      }
    >

      {/* ================================================================
      Background
      ================================================================ */}

      <div
        className={
          styles.flagshipBackground
        }
      />

      {/* ================================================================
      Inner
      ================================================================ */}

      <div
        className={
          styles.flagshipInner
        }
      >

        {/* ============================================================
        Header
        ============================================================ */}

        <header
          className={
            styles.flagshipHeader
          }
        >

          {/* ========================================================
          Eyebrow
          ======================================================== */}

          <div
            className={
              styles.flagshipEyebrow
            }
          >

            SEMANTIC ENTRY NODE

          </div>

          {/* ========================================================
          Title
          ======================================================== */}

          <h2
            className={
              styles.flagshipTitle
            }
          >

            {product?.name}

          </h2>

          {/* ========================================================
          Maker
          ======================================================== */}

          {product?.maker && (

            <div
              className={
                styles.flagshipMaker
              }
            >

              {product.maker}

            </div>

          )}

        </header>

        {/* ============================================================
        Body
        ============================================================ */}

        <div
          className={
            styles.flagshipBody
          }
        >

          {/* ========================================================
          Visual
          ======================================================== */}

          <div
            className={
              styles.flagshipVisual
            }
          >

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

          {/* ========================================================
          Semantic Area
          ======================================================== */}

          <div
            className={
              styles.flagshipSemantic
            }
          >

            {/* ====================================================
            Description
            ==================================================== */}

            {recommendationReason && (

              <p
                className={
                  styles.flagshipDescription
                }
              >

                {recommendationReason}

              </p>

            )}

            {/* ====================================================
            Chips
            ==================================================== */}

            <div
              className={
                styles.flagshipChips
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

        {/* ============================================================
        Footer
        ============================================================ */}

        <footer
          className={
            styles.flagshipFooter
          }
        >

          {/* ========================================================
          Price
          ======================================================== */}

          {product?.price && (

            <div
              className={
                styles.flagshipPrice
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
              styles.flagshipActions
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
                styles.flagshipSecondaryCTA
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
                styles.flagshipCTA
              }
            >

              ショップへ

            </Link>

          </div>

        </footer>

      </div>

    </section>

  )
}