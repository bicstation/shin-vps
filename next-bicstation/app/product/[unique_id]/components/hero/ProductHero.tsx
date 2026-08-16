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
// ✓ Product Price
// ✓ Product Points
// ✓ Section Navigation
//
// Product Points
//
// Backend / AI Analysis
//        ↓
// product_points
//        ↓
// Product Runtime
//        ↓
// ProductHero
//
// Product Points are displayed as provided.
// No semantic generation or inference is performed here.
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
// Product Evaluation is handled by:
//
//      ProductEvaluationSection
//
// ============================================================================

'use client'

import Link
  from 'next/link'

import styles
  from './styles/ProductHero.module.css'


/* ============================================================================
🔥 Projection Types
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Product Type
============================================================================ */

/**
 * ProductHero receives the projected product.
 *
 * Product Points may currently exist under either:
 *
 *   productPoints
 *
 * or:
 *
 *   product_points
 *
 * depending on the current projection shape.
 *
 * This compatibility type does not generate semantic meaning.
 */

type ProductHeroProduct =
  ProjectedProduct
  & {

    productPoints?: unknown

    product_points?: unknown

  }


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}


/* ============================================================================
🔥 Resolve Product
============================================================================ */

/**
 * Resolve the actual product object.
 *
 * This follows the same defensive resolution pattern
 * already used by the existing FinalCta.
 *
 * Supported shapes:
 *
 *   product
 *
 *   product.product
 *
 *   product.data.product
 *
 * No semantic transformation is performed.
 */

function resolveProduct(
  input: ProductHeroProduct,
): ProductHeroProduct {

  if (
    (input as any)?.data?.product
  ) {

    return (
      (input as any).data.product
    )

  }

  if (
    (input as any)?.product
  ) {

    return (
      (input as any).product
    )

  }

  return input

}


/* ============================================================================
🔥 Normalize Product Points
============================================================================ */

/**
 * Normalize Product Points for presentation.
 *
 * This follows the existing CTA behavior.
 *
 * Supported:
 *
 * ✓ string[]
 * ✓ number[]
 * ✓ JSON array string
 * ✓ newline separated string
 * ✓ comma separated string
 * ✓ Japanese comma separated string
 *
 * This is presentation normalization only.
 *
 * No semantic meaning is generated.
 */

function normalizeProductPoints(
  value:
    unknown,
): string[] {

  /* ==========================================================================
  ARRAY
  ========================================================================== */

  if (
    Array.isArray(
      value
    )
  ) {

    return (

      value

        .filter(
          (
            item
          ): item is string | number =>

            typeof item === 'string'
            ||
            typeof item === 'number'

        )

        .map(
          item =>
            String(
              item
            ).trim()
        )

        .filter(Boolean)

    )

  }


  /* ==========================================================================
  STRING
  ========================================================================== */

  if (
    typeof value !== 'string'
    ||
    !value.trim()
  ) {

    return []

  }


  const text =
    value.trim()


  /* ==========================================================================
  JSON ARRAY
  ========================================================================== */

  try {

    const parsed =
      JSON.parse(
        text
      )

    if (
      Array.isArray(
        parsed
      )
    ) {

      return (

        parsed

          .filter(
            (
              item
            ): item is string | number =>

              typeof item === 'string'
              ||
              typeof item === 'number'

          )

          .map(
            item =>
              String(
                item
              ).trim()
          )

          .filter(Boolean)

      )

    }

  } catch {

    /*
     * Not a JSON array.
     *
     * Continue as a normal string.
     */

  }


  /* ==========================================================================
  DELIMITED STRING
  ========================================================================== */

  return (

    text

      .split(
        /\n|、|，|,/
      )

      .map(
        item =>
          item.trim()
      )

      .filter(Boolean)

  )

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHero({

  product,

}: Props) {

  /* ==========================================================================
  Product Resolution
  ========================================================================== */

  const resolvedProduct =
    resolveProduct(
      product as ProductHeroProduct
    )


  /* ==========================================================================
  🔥 DEBUG — PRODUCT HERO PRODUCT POINTS
  ========================================================================== */
  console.log(
    '🔥 FINAL CTA PRODUCT POINTS OBSERVATION',
    {
      product,
      resolvedProduct,

      productPoints:
        resolvedProduct?.productPoints,

      product_points:
        resolvedProduct?.product_points,

      strengths:
        resolvedProduct?.strengths,

      keys:
        Object.keys(
          resolvedProduct || {}
        ),
    }
  )

  /* ==========================================================================
  Product Identity
  ========================================================================== */

  const title =
    resolvedProduct?.name
    ||
    product?.name
    ||
    'PRODUCT'


  const image =
    resolvedProduct?.imageUrl
    ||
    product?.imageUrl


  const maker =
    resolvedProduct?.maker
    ||
    product?.maker
    ||
    'UNKNOWN'


  const price =
    resolvedProduct?.price
    ??
    product?.price


  /* ==========================================================================
  Product Points
  ========================================================================== */

  const productPoints =

    normalizeProductPoints(

      resolvedProduct?.productPoints

      ??

      resolvedProduct?.product_points

    )


  /*
   * Hero displays the three Product Points
   * supplied by the Product Runtime.
   *
   * No additional points are generated.
   */

  const visibleProductPoints =
    productPoints.slice(
      0,
      3
    )


  /* ==========================================================================
  Render
  ========================================================================== */

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

            {
              maker
            }

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
          image
          &&
          (

            <div
              className={
                styles.productHeroImageArea
              }
            >

              <img

                src={
                  image
                }

                alt={
                  title
                }

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

            {
              title
            }

          </h1>


          {/* ================================================================
          PRODUCT POINTS
          ================================================================ */}

          {
            visibleProductPoints.length > 0
            &&
            (

              <div
                className={
                  styles.productHeroPoints
                }

                aria-label={
                  'このPCのポイント'
                }
              >

                <div
                  className={
                    styles.productHeroPointsLabel
                  }
                >

                  このPCのポイント

                </div>


                <div
                  className={
                    styles.productHeroPointsList
                  }
                >

                  {
                    visibleProductPoints.map(
                      (
                        point,
                        index
                      ) => (

                        <div
                          key={
                            `${point}-${index}`
                          }

                          className={
                            styles.productHeroPoint
                          }
                        >

                          <div
                            className={
                              styles.productHeroPointNumber
                            }
                          >

                            {
                              String(
                                index + 1
                              ).padStart(
                                2,
                                '0'
                              )
                            }

                          </div>


                          <div
                            className={
                              styles.productHeroPointText
                            }
                          >

                            {
                              point
                            }

                          </div>

                        </div>

                      )
                    )

                  }

                </div>

              </div>

            )
          }

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
            &&
            (

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
            href={
              '#semantic'
            }

            className={
              styles.productHeroPrimary
            }
          >

            選ばれる理由を見る

          </Link>


          <Link
            href={
              '#related'
            }

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