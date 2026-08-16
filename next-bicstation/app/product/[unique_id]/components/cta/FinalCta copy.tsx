/* eslint-disable @next/next/no-img-element */
// app/product/[unique_id]/components/cta/FinalCta.tsx

'use client'

import { useMemo } from 'react'

import styles
  from './FinalCta.module.css'

/* =========================================
🔥 Projection
========================================= */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'

/* =========================================
🔥 Types
========================================= */

interface FinalCtaProps {

  product: ProjectedProduct

  semanticRuntime?: ProjectedSemanticRuntime

  summary?: {

    p1?: string

    p2?: string

    p3?: string

  } | null

  finalUrl?: string

  isSoftware?: boolean

}

/* =========================================
🔥 Purchase Link
========================================= */

function buildCTA(

  product: ProjectedProduct,

  finalUrl?: string,

) {

  return (

    finalUrl

    ||

    product.affiliateUrl

    ||

    product.url

    ||

    null

  )

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

    Object.entries(grouped)

  if (!entries.length) {

    return null

  }

  return (

    <div
      className={
        styles.semanticGroups
      }
    >

      {

        entries

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

              <div
                className={
                  styles.semanticGroupTitle
                }
              >

                {group}

              </div>

              <div
                className={
                  styles.semanticChipList
                }
              >

                {

                  (attrs || [])

                    .slice(0, 3)

                    .map((attr: any) => (

                      <div

                        key={attr.slug}

                        className={
                          styles.semanticChip
                        }

                      >

                        {attr.name}

                      </div>

                    ))

                }

              </div>

            </div>

          ))

      }

    </div>

  )

}
/* =========================================
🔥 Component
========================================= */

export default function FinalCta({

  product,

  semanticRuntime,

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

          ||

          summary.p2

          ||

          summary.p3

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
  // Semantic Runtime
  // ======================================

  const grouped =

    semanticRuntime

      ?.groupedAttributes

    ??

    {}

  // ======================================
  // Recommendation Score
  // ======================================

  // Recovery Mission:
  // Runtime未対応のため固定値

  const confidence =

    92

  // ======================================
  // CTA
  // ======================================

  const href =

    buildCTA(

      product,

      finalUrl,

    )

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

            Product Recommendation

          </div>

          <h2
            className={
              styles.title
            }
          >

            最終おすすめPC

          </h2>

          <p
            className={
              styles.description
            }
          >

            用途・性能バランスを
            総合的に評価したおすすめモデルです。

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

            {/* =============================
            Brand
            ============================= */}

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

              {

                product.maker

                ??

                'メーカー'

              }

              {' '}
              正規ストア

            </div>

            {/* =============================
            Product Name
            ============================= */}

            <div
              className={
                styles.productName
              }
            >

              {

                product.name

              }

            </div>

            {/* =============================
            Confidence
            ============================= */}

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

                {

                  confidence

                }

                %

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

                  用途・性能バランスを
                  総合的に評価しています。

                </span>

              </div>

            </div>

            {/* =============================
            Features
            ============================= */}

            <div
              className={
                styles.featureList
              }
            >

              {

                features.map(

                  (

                    feature,

                    index,

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

                        {

                          feature

                        }

                      </div>

                    </div>

                  )

                )

              }

            </div>

            {/* =============================
            Semantic Groups
            ============================= */}

            <SemanticGroups

              grouped={

                grouped

              }

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

            {/* =============================
            Image
            ============================= */}

            <div
              className={
                styles.imageWrap
              }
            >

              <img

                src={

                  product.imageUrl

                  ||

                  '/no-image.webp'

                }

                alt={
                  product.name
                }

                className={
                  styles.image
                }

              />

            </div>

            {/* =============================
            CTA
            ============================= */}

            <div
              className={
                styles.ctaArea
              }
            >

              {

                href ? (

                  <a

                    id="buy"

                    href={
                      href
                    }

                    target="_blank"

                    rel="nofollow noopener noreferrer"

                    className={
                      styles.ctaButton
                    }

                  >

                    <span
                      className={
                        styles.ctaMain
                      }
                    >

                      👉 最新価格・在庫を確認する

                    </span>

                    <span
                      className={
                        styles.ctaSub
                      }
                    >

                      正規販売ページを開く

                    </span>

                  </a>

                ) : (

                  <button

                    disabled

                    className={
                      styles.ctaButtonDisabled
                    }

                  >

                    <span
                      className={
                        styles.ctaMain
                      }
                    >

                      購入ページを準備中

                    </span>

                    <span
                      className={
                        styles.ctaSub
                      }
                    >

                      リンク情報を確認しています

                    </span>

                  </button>

                )

              }

              {/* =========================
              Trust
              ========================= */}

              <div
                className={
                  styles.trust
                }
              >

                正規ストア・メーカー保証対応

              </div>

              {/* =========================
              Urgency
              ========================= */}

              <div
                className={
                  styles.urgency
                }
              >

                ※価格・在庫・販売条件は販売ページでご確認ください

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  )

}
