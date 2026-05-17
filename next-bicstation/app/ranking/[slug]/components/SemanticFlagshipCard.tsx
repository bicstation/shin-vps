// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/SemanticFlagshipCard.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import ProductSemanticChips from './ProductSemanticChips'

import styles from '../styles/flagship.module.css'

type Props = {
  product: any
}

/* ============================================================================
🔥 Semantic Flagship Card
============================================================================ */

export default function SemanticFlagshipCard({
  product,
}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const semanticWeight =

    Number(
      product?.semantic_weight || 0
    )

  const semanticRole =
    product?.semantic_role

  const recommendation =
    product?.recommendation_reason

  /* ==========================================================================
  🔥 Presentation
  ========================================================================== */

  const emphasisLevel =

    semanticWeight >= 0.95
      ? 'legendary'

      : semanticWeight >= 0.85
        ? 'high'

        : 'normal'

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <article
      className={`
        ${styles.flagshipCard}
        ${styles[`flagship-${emphasisLevel}`]}
      `}
    >

      {/* ================================================================
      Background
      ================================================================ */}

      <div className={styles.flagshipGlow} />

      <div className={styles.flagshipNoise} />

      {/* ================================================================
      Main
      ================================================================ */}

      <div className={styles.flagshipInner}>

        {/* ============================================================
        Left
        ============================================================ */}

        <div className={styles.flagshipContent}>

          {/* ========================================================
          Semantic Header
          ======================================================== */}

          <div className={styles.flagshipTop}>

            <div
              className={styles.flagshipBadge}
            >
              SEMANTIC FLAGSHIP
            </div>

            {semanticRole && (

              <div
                className={
                  styles.flagshipRole
                }
              >
                {semanticRole}
              </div>

            )}

          </div>

          {/* ========================================================
          Title
          ======================================================== */}

          <h2 className={styles.flagshipTitle}>

            {product?.name}

          </h2>

          {/* ========================================================
          Description
          ======================================================== */}

          <p className={styles.flagshipDescription}>

            {recommendation
              ||
              product?.description}

          </p>

          {/* ========================================================
          Semantic Chips
          ======================================================== */}

          <ProductSemanticChips
            groupedAttributes={
              product?.grouped_attributes
            }
          />

          {/* ========================================================
          Specs
          ======================================================== */}

          <div className={styles.flagshipSpecs}>

            {product?.cpu_model && (

              <div
                className={
                  styles.flagshipSpec
                }
              >

                <span>CPU</span>

                <strong>
                  {product.cpu_model}
                </strong>

              </div>

            )}

            {product?.gpu_model && (

              <div
                className={
                  styles.flagshipSpec
                }
              >

                <span>GPU</span>

                <strong>
                  {product.gpu_model}
                </strong>

              </div>

            )}

            {product?.memory_gb && (

              <div
                className={
                  styles.flagshipSpec
                }
              >

                <span>Memory</span>

                <strong>
                  {product.memory_gb}GB
                </strong>

              </div>

            )}

          </div>

          {/* ========================================================
          Footer
          ======================================================== */}

          <div className={styles.flagshipFooter}>

            {/* Price */}

            <div
              className={
                styles.flagshipPrice
              }
            >

              ¥
              {Number(
                product?.price || 0
              ).toLocaleString()}

            </div>

            {/* CTA */}

            <Link
              href={
                product?.url || '#'
              }
              target="_blank"
              className={
                styles.flagshipButton
              }
            >

              詳細を見る

            </Link>

          </div>

        </div>

        {/* ============================================================
        Right
        ============================================================ */}

        <div className={styles.flagshipVisual}>

          {/* ========================================================
          Image
          ======================================================== */}

          {product?.image_url && (

            <img
              src={product.image_url}
              alt={product?.name}
              className={
                styles.flagshipImage
              }
            />

          )}

          {/* ========================================================
          Floating Score
          ======================================================== */}

          <div
            className={
              styles.flagshipScore
            }
          >

            <div
              className={
                styles.flagshipScoreLabel
              }
            >

              Semantic Score

            </div>

            <div
              className={
                styles.flagshipScoreValue
              }
            >

              {Math.round(
                semanticWeight * 100
              )}

            </div>

          </div>

        </div>

      </div>

    </article>

  )
}