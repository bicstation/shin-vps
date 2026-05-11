// /home/maya/shin-dev/shin-vps/next-bicstation/app/pc-finder/components/FinderResultCard.tsx
/* eslint-disable @next/next/no-img-element */

/* eslint-disable @next/next/no-img-element */

'use client'

/* =========================================
🔥 Next
========================================= */

import Link
  from 'next/link'

/* =========================================
🔥 Styles
========================================= */

import styles
  from '../styles/pcFinder.module.css'

/* =========================================
🔥 Helpers
========================================= */

import {

  resolveProductImage,

  resolveProductPrice,

  extractLimitedSemanticTags,

  resolveRecommendationBadge,

} from '../lib/finderHelpers'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any

  index?: number
}

/* =========================================
🔥 Finder Result Card
========================================= */

export default function
FinderResultCard({

  product,

  index = 0,

}: Props) {

  // ======================================
  // Safe
  // ======================================

  if (
    !product?.unique_id
  ) {

    return null
  }

  // ======================================
  // Basic
  // ======================================

  const image =

    resolveProductImage(
      product
    )

  const price =

    resolveProductPrice(
      product
    )

  const title =

    product?.shortTitle

    ||

    product?.name

    ||

    'Recommended PC'

  // ======================================
  // Semantic Tags
  // ======================================

  const semanticTags =

    extractLimitedSemanticTags(
      product,
      6
    )

  // ======================================
  // Recommendation
  // ======================================

  const recommendationBadge =

    resolveRecommendationBadge(

      product
        ?.recommendation_score

    )

  // ======================================
  // Scores
  // ======================================

  const recommendationScore =

    product
      ?.recommendation_score

  const confidence =

    product
      ?.confidence

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 FinderResultCard',
    {

      unique_id:
        product?.unique_id,

      recommendationScore,

      confidence,

    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <Link

      href={
        `/product/${product.unique_id}`
      }

      className={
        styles.card
      }

    >

      {/* ==================================
      Image
      ================================== */}

      <div
        className={
          styles.cardImageWrap
        }
      >

        <img

          src={image}

          alt={title}

          className={
            styles.cardImage
          }

        />

        {/* ============================= */}
        {/* Rank */}
        {/* ============================= */}

        <div
          className={
            styles.cardRank
          }
        >

          #{index + 1}

        </div>

        {/* ============================= */}
        {/* Recommendation */}
        {/* ============================= */}

        <div
          className={
            styles.cardRecommendation
          }
        >

          {recommendationBadge}

        </div>

      </div>

      {/* ==================================
      Body
      ================================== */}

      <div
        className={
          styles.cardBody
        }
      >

        {/* ============================= */}
        {/* Price */}
        {/* ============================= */}

        <div
          className={
            styles.cardPrice
          }
        >

          {price}

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h3
          className={
            styles.cardTitle
          }
        >

          {title}

        </h3>

        {/* ============================= */}
        {/* Specs */}
        {/* ============================= */}

        <div
          className={
            styles.cardSpecs
          }
        >

          <div
            className={
              styles.cardSpec
            }
          >

            🧠 {
              product?.cpu_model
              || 'CPU'
            }

          </div>

          <div
            className={
              styles.cardSpec
            }
          >

            🎮 {
              product?.gpu_model
              || 'GPU'
            }

          </div>

        </div>

        {/* ============================= */}
        {/* Semantic */}
        {/* ============================= */}

        {!!semanticTags.length && (

          <div
            className={
              styles.semanticArea
            }
          >

            {semanticTags.map(
              (
                tag: any,
                tagIndex: number
              ) => (

                <div

                  key={
                    tag?.slug
                    || tagIndex
                  }

                  className={
                    styles.semanticBadge
                  }

                >

                  {
                    tag?.name
                  }

                </div>

              )
            )}

          </div>

        )}

        {/* ============================= */}
        {/* Metrics */}
        {/* ============================= */}

        <div
          className={
            styles.cardMetrics
          }
        >

          <div
            className={
              styles.metric
            }
          >

            <span>

              Recommendation

            </span>

            <strong>

              {
                recommendationScore
                || 0
              }

            </strong>

          </div>

          <div
            className={
              styles.metric
            }
          >

            <span>

              Confidence

            </span>

            <strong>

              {
                confidence
                || 0
              }%

            </strong>

          </div>

        </div>

      </div>

    </Link>
  )
}