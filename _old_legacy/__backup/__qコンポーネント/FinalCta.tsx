/* eslint-disable @next/next/no-img-element */
'use client'

import React, {
  useMemo,
} from 'react'

import SemanticSection
  from '@/shared/components/semantic/SemanticSection'

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
🔥 Component
========================================= */

const FinalCta:
React.FC<FinalCtaProps> = ({

  product,

  summary,

  finalUrl,

  isSoftware = false,

}) => {

  // --------------------------------
  // Features
  // --------------------------------
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

          'すぐに導入できるシンプル構成',

          '初心者でも迷わない操作性',

          '導入直後から利用可能',

        ]

        : [

          'gaming / creator 両対応の高バランス構成',

          '長期利用を前提にしたsemantic構成',

          '初心者でも扱いやすいrecommendation設計',

        ]

    }, [
      summary,
      isSoftware,
    ])

  // --------------------------------
  // Semantic
  // --------------------------------
  const grouped =
    product
      ?.grouped_attributes
      || {}

  const confidence =
    product
      ?.semantic_confidence
      || 92

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

        {/* ========================= */}
        {/* glow */}
        {/* ========================= */}

        <div
          className={
            styles.glow
          }
        />

        {/* ========================= */}
        {/* Header */}
        {/* ========================= */}

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
            semantic recommendation /
            workload analysis /
            price balance
            を総合評価。
          </p>

        </div>

        {/* ========================= */}
        {/* Main */}
        {/* ========================= */}

        <div
          className={
            styles.grid
          }
        >

          {/* ================================= */}
          {/* LEFT */}
          {/* ================================= */}

          <div
            className={
              styles.left
            }
          >

            {/* maker */}
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

            {/* product name */}
            <div
              className={
                styles.productName
              }
            >
              {product.name}
            </div>

            {/* confidence */}
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
                  semantic similarity /
                  recommendation balance /
                  workload analysis
                </span>

              </div>

            </div>

            {/* features */}
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

            {/* semantic groups */}
            <div
              className={
                styles.semanticGroups
              }
            >

              {Object.entries(
                grouped
              )
                .slice(0, 3)
                .map((
                  [
                    group,
                    attrs,
                  ]
                ) => (

                  <SemanticSection
                    key={group}

                    title={group}

                    groupType={group}

                    attributes={
                      attrs as any[]
                    }
                  />

                ))}

            </div>

          </div>

          {/* ================================= */}
          {/* RIGHT */}
          {/* ================================= */}

          <div
            className={
              styles.right
            }
          >

            {/* image */}
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

            {/* CTA */}
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
                  👉
                  在庫があるうちに確認する
                </span>

                <span
                  className={
                    styles.ctaSub
                  }
                >
                  公式ストアで詳細を見る
                </span>

              </a>

              {/* trust */}
              <div
                className={
                  styles.trust
                }
              >
                正規ストア・メーカー保証対応
              </div>

              {/* urgency */}
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

export default FinalCta
