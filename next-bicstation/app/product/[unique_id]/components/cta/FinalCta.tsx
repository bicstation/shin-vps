/* eslint-disable @next/next/no-img-element */
// app/product/[unique_id]/components/cta/FinalCta.tsx

'use client'

import React, {
  useMemo,
} from 'react'

import styles
  from './FinalCta.module.css'

/* =========================================
🔥 Types
========================================= */

interface FinalCtaProps {

  product: {
    maker?: string
    name?: string
    image_url?: string

    grouped_attributes?: Record<
      string,
      any[]
    >

    semantic_confidence?: number
  }

  summary?: {
    p1?: string
    p2?: string
    p3?: string
  } | null

  finalUrl?: string

  isSoftware?: boolean
}

/* =========================================
🔥 Semantic Groups
========================================= */

function SemanticGroups({
  grouped,
}: {
  grouped?: Record<
    string,
    any[]
  >
}) {

  if (!grouped) {

    return null
  }

  const entries =

    Object.entries(
      grouped
    )

  if (!entries.length) {

    return null
  }

  return (

    <div
      className={
        styles.semanticGroups
      }
    >

      {entries
        .slice(0, 3)
        .map(([

          group,

          attrs,

        ]) => (

          <div
            key={group}

            className={
              styles.semanticGroup
            }
          >

            {/* ===================== */}
            {/* Group */}
            {/* ===================== */}

            <div
              className={
                styles.semanticGroupTitle
              }
            >

              {group}

            </div>

            {/* ===================== */}
            {/* Chips */}
            {/* ===================== */}

            <div
              className={
                styles.semanticChipList
              }
            >

              {(attrs || [])
                .slice(0, 3)
                .map(attr => (

                  <div
                    key={
                      attr.slug
                    }

                    className={
                      styles.semanticChip
                    }
                  >

                    {attr.name}

                  </div>

                ))}

            </div>

          </div>

        ))}

    </div>

  )
}

/* =========================================
🔥 Component
========================================= */

export default function
FinalCta({

  product,

  summary,

  finalUrl,

  isSoftware = false,

}: FinalCtaProps) {

  // ======================================
  // Features
  // ======================================

  const features =
    useMemo(() => {

      if (
        summary
        &&
        (
          summary.p1
          || summary.p2
          || summary.p3
        )
      ) {

        return [

          summary.p1,

          summary.p2,

          summary.p3,

        ].filter(Boolean)
      }

      return isSoftware

        ? [

          'すぐに導入しやすいシンプル構成',

          '初心者でも扱いやすい設計',

          '導入直後から使いやすい環境',

        ]

        : [

          'ゲームと制作の両方に対応しやすい高バランス構成',

          '長期利用を想定した安定した性能設計',

          '初心者でも選びやすいおすすめ構成',

        ]

    }, [

      summary,

      isSoftware,

    ])

  // ======================================
  // Semantic
  // ======================================

  const grouped =

    product
      ?.grouped_attributes
      || {}

  const confidence =

    product
      ?.semantic_confidence
      || 92

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

      <div
        className={
          styles.card
        }
      >

        {/* ==================================
        Glow
        ================================== */}

        <div
          className={
            styles.glow
          }
        />

        {/* ==================================
        Header
        ================================== */}

        <div
          className={
            styles.header
          }
        >

          <div
            className={
              styles.label
            }
          >

            Semantic Recommendation

          </div>

          <h2
            className={
              styles.title
            }
          >

            最終おすすめ分析

          </h2>

          <p
            className={
              styles.description
            }
          >

            用途・性能バランス・
            recommendation semantic
            を総合分析しています。

          </p>

        </div>

        {/* ==================================
        Main
        ================================== */}

        <div
          className={
            styles.grid
          }
        >

          {/* ==================================
          LEFT
          ================================== */}

          <div
            className={
              styles.left
            }
          >

            {/* ============================= */}
            {/* Brand */}
            {/* ============================= */}

            <div
              className={
                styles.brand
              }
            >

              <span
                className={
                  styles.brandDot
                }
              />

              {product.maker}
              正規ストア

            </div>

            {/* ============================= */}
            {/* Product Name */}
            {/* ============================= */}

            <div
              className={
                styles.productName
              }
            >

              {product.name}

            </div>

            {/* ============================= */}
            {/* Confidence */}
            {/* ============================= */}

            <div
              className={
                styles.confidenceRow
              }
            >

              <div
                className={
                  styles.confidenceCircle
                }
              >

                {confidence}%

              </div>

              <div
                className={
                  styles.confidenceText
                }
              >

                <strong>
                  おすすめ一致度
                </strong>

                <span>
                  用途・性能・
                  recommendation semantic
                  を総合評価
                </span>

              </div>

            </div>

            {/* ============================= */}
            {/* Features */}
            {/* ============================= */}

            <div
              className={
                styles.featureList
              }
            >

              {features.map((

                feature,

                index

              ) => (

                <div
                  key={index}

                  className={
                    styles.featureItem
                  }
                >

                  <div
                    className={
                      styles.featureIcon
                    }
                  >

                    ✓

                  </div>

                  <div
                    className={
                      styles.featureText
                    }
                  >

                    {feature}

                  </div>

                </div>

              ))}

            </div>

            {/* ============================= */}
            {/* Semantic Groups */}
            {/* ============================= */}

            <SemanticGroups
              grouped={grouped}
            />

          </div>

          {/* ==================================
          RIGHT
          ================================== */}

          <div
            className={
              styles.right
            }
          >

            {/* ============================= */}
            {/* Image */}
            {/* ============================= */}

            <div
              className={
                styles.imageWrap
              }
            >

              <img
                src={
                  product.image_url
                  || '/no-image.png'
                }

                alt={
                  product.name
                }

                className={
                  styles.image
                }
              />

            </div>

            {/* ============================= */}
            {/* CTA */}
            {/* ============================= */}

            <div
              className={
                styles.ctaArea
              }
            >

              <a
                id="buy"

                href={
                  finalUrl
                  || '#'
                }

                target="_blank"

                rel="
                  nofollow
                  noopener
                  noreferrer
                "

                className={
                  styles.ctaButton
                }
              >

                <span
                  className={
                    styles.ctaMain
                  }
                >

                  👉 在庫があるうちに確認する

                </span>

                <span
                  className={
                    styles.ctaSub
                  }
                >

                  公式ストアで詳細を見る

                </span>

              </a>

              {/* ========================= */}
              {/* Trust */}
              {/* ========================= */}

              <div
                className={
                  styles.trust
                }
              >

                正規ストア・メーカー保証対応

              </div>

              {/* ========================= */}
              {/* Urgency */}
              {/* ========================= */}

              <div
                className={
                  styles.urgency
                }
              >

                ※価格・在庫は変動する場合があります

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  )
}