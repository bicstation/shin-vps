// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHero.tsx
//
// SHIN CORE LINX
// Product Detail Hero
//
// RESPONSIBILITY
//
// Product Runtime
//      ↓
// ProductHero
//
// ProductHero = Product Identity Experience
//
// ✓ Maker
// ✓ Product Image
// ✓ Product Name
// ✓ Price
// ✓ Section Navigation
//
// ✗ Semantic Summary rendering
// ✗ Target User interpretation
// ✗ Workflow rendering
// ✗ Semantic generation
// ✗ Workflow inference
// ✗ Recommendation generation
// ✗ Runtime generation
//
// Detailed semantic understanding is handled by:
//
//      ProductAISummary
//
// Detailed capability / recommendation evidence is handled by:
//
//      ProductHeroCapability
//
// ============================================================================

'use client'

import Link
  from 'next/link'

import styles
  from './styles/ProductHero.module.css'

/* ============================================================================
// Projection Types
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
// Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}

/* ============================================================================
// Component
============================================================================ */

export default function ProductHero({

  product,

}: Props) {

  /* ==========================================================================
// Product Identity
============================================================================ */

  const title =
    product?.name
    ||
    'PRODUCT'

  const image =
    product?.imageUrl

  const maker =
    product?.maker
    ||
    'UNKNOWN'

  const price =
    product?.price

  /* ==========================================================================
// Render
============================================================================ */

  return (

    <section
      className={
        styles.productHero
      }
    >

      {/* ======================================================================
      BACKGROUND
      ====================================================================== */}

      <div
        className={
          styles.productHeroBackgroundOverlay
        }

        aria-hidden="true"
      />


      {/* ======================================================================
      TOP — MAKER
      ====================================================================== */}

      <div
        className={
          styles.productHeroTop
        }
      >

        <div
          className={
            styles.productHeroTags
          }
        >

          <div
            className={
              styles.productHeroTag
            }
          >

            {maker}

          </div>

        </div>

      </div>


      {/* ======================================================================
      MAIN
      ====================================================================== */}

      <div
        className={
          styles.productHeroMain
        }
      >

        {/* ====================================================================
        IMAGE
        ==================================================================== */}

        {
          image && (

            <div
              className={
                styles.productHeroImageArea
              }
            >

              <img
                src={image}

                alt={title}

                className={
                  styles.productHeroImage
                }

              />

            </div>

          )
        }


        {/* ====================================================================
        PRODUCT IDENTITY
        ==================================================================== */}

        <div
          className={
            styles.productHeroContent
          }
        >

          <div
            className={
              styles.productHeroLabel
            }
          >

            PRODUCT

          </div>


          <h1
            className={
              styles.productHeroTitle
            }
          >

            {title}

          </h1>


        </div>

      </div>


      {/* ======================================================================
      BOTTOM — PRICE / NAVIGATION
      ====================================================================== */}

      <div
        className={
          styles.productHeroBottom
        }
      >

        {/* ====================================================================
        PRICE
        ==================================================================== */}

        <div
          className={
            styles.productHeroPriceArea
          }
        >

          <div
            className={
              styles.productHeroPriceLabel
            }
          >

            PRICE

          </div>

          {

            price != null
            && (

              <div
                className={
                  styles.productHeroPrice
                }
              >

                ¥
                {
                  Number(
                    price
                  ).toLocaleString()
                }

              </div>

            )

          }

        </div>


        {/* ====================================================================
        NAVIGATION
        ==================================================================== */}

        <div
          className={
            styles.productHeroActions
          }
        >

          <Link
            href="#semantic"
            className={
              styles.productHeroPrimary
            }
          >

            選ばれる理由を見る

          </Link>


          <Link
            href="#related"
            className={
              styles.productHeroSecondary
            }
          >

            関連製品を見る

          </Link>

        </div>

      </div>

    </section>

  )

}