// ============================================================================
// FILE:
// /home/maya/shin-vps/shin-vps/next-bicstation/app/product/[unique_id]/section/ProductPointsSection.tsx
//
// SHIN CORE LINX
// Product Detail — Product Points
//
// RESPONSIBILITY
//
// Product Runtime
//        ↓
// ProductPointsSection
//        ↓
// Product Points
//
// ProductPointsSection = Product Key Points Experience
//
// ✓ Displays Backend-derived productPoints
// ✓ Displays Product Points in Backend order
// ✓ Handles empty / unavailable Product Points
// ✓ Provides a stable section anchor
// ✓ Uses Product Points Section presentation styles
//
// ✗ Point generation
// ✗ AI inference
// ✗ Semantic generation
// ✗ Product classification
// ✗ Point selection
// ✗ Point rewriting
// ✗ Recommendation generation
//
// ============================================================================


/* ============================================================================
🔥 Projection
============================================================================ */

import type {
  ProjectedProduct,
} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './styles/ProductPointsSection.module.css'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductPointsSection({

  product,

}: Props) {


  /* ==========================================================================
  Product Points
  ========================================================================== */

  const productPoints =
    product?.productPoints
    || []


  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (
    productPoints.length === 0
  ) {

    return null

  }


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section

      className={
        styles.productPointsSection
      }

      id="product-points"

      aria-labelledby="product-points-title"

    >

      <div

        className={
          styles.productPointsInner
        }

      >

        {/* ====================================================================
        HEADER
        ==================================================================== */}

        <div

          className={
            styles.productPointsHeader
          }

        >

          {/* ==================================================================
          LABEL
          ================================================================== */}

          <div

            className={
              styles.productPointsLabel
            }

          >

            PRODUCT POINTS

          </div>


          {/* ==================================================================
          TITLE
          ================================================================== */}

          <h2

            id="product-points-title"

            className={
              styles.productPointsTitle
            }

          >

            このPCの3つのポイント

          </h2>


          {/* ==================================================================
          DESCRIPTION
          ================================================================== */}

          <p

            className={
              styles.productPointsDescription
            }

          >

            このPCを理解するうえで、
            特に注目したいポイントを整理しています。

          </p>

        </div>


        {/* ====================================================================
        POINTS
        ==================================================================== */}

        <div

          className={
            styles.productPointsGrid
          }

        >

          {

            productPoints.map(

              (
                point,
                index,
              ) => (

                <article

                  key={
                    `${index}-${point}`
                  }

                  className={
                    styles.productPointCard
                  }

                >

                  {/* ==========================================================
                  NUMBER
                  ========================================================== */}

                  <div

                    className={
                      styles.productPointNumber
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


                  {/* ==========================================================
                  POINT
                  ========================================================== */}

                  <p

                    className={
                      styles.productPointText
                    }

                  >

                    {point}

                  </p>

                </article>

              )

            )

          }

        </div>

      </div>

    </section>

  )

}