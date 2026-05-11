// /app/product/[unique_id]/components/recommendation/RelatedProducts.tsx

import Link
  from 'next/link'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './RelatedProducts.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {

  product: any

  products: any[]
}

/* =========================================
🔥 Match Reason
========================================= */

function formatMatchReason(
  reasons: any
): string[] {

  let list: string[] = []

  // ======================================
  // Normalize
  // ======================================

  if (
    Array.isArray(reasons)
  ) {

    list = reasons

  } else if (
    typeof reasons ===
    'string'
  ) {

    list =
      reasons
        .split(',')
        .map(v => v.trim())
  }

  // ======================================
  // Semantic Map
  // ======================================

  const map:
    Record<
      string,
      string
    > = {

    price:
      '同価格帯で比較しやすい',

    gpu:
      '近いGPU性能構成',

    usage:
      '似た用途に向いている',

    creator:
      '制作向け構成が近い',

    gaming:
      'ゲーム用途が近い',

    balance:
      '全体バランスが近い',
  }

  return list
    .map(
      key => map[key]
    )
    .filter(Boolean)
}

/* =========================================
🔥 Similarity Badge
========================================= */

function SimilarityBadge({
  index,
}: {
  index: number
}) {

  if (index === 0) {

    return (

      <div
        className={
          styles.topBadge
        }
      >

        TOP MATCH

      </div>

    )
  }

  return (

    <div
      className={
        styles.badge
      }
    >

      SIMILAR

    </div>

  )
}

/* =========================================
🔥 Empty
========================================= */

function EmptyState() {

  return (

    <div
      className={
        styles.empty
      }
    >

      <p
        className={
          styles.emptyText
        }
      >

        関連するおすすめ構成はまだありません

      </p>

    </div>

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
        .slice(0, 2)
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
RelatedProducts({

  product,

  products,

}: Props) {

  // ======================================
  // Safety
  // ======================================

  if (
    !product
  ) {

    return null
  }

  // ======================================
  // Empty
  // ======================================

  if (
    !products?.length
  ) {

    return (
      <EmptyState />
    )
  }

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

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

          似た用途でおすすめの構成

        </h2>

        <p
          className={
            styles.description
          }
        >

          用途・性能バランス・
          semantic intent が近い
          おすすめ構成を表示しています。

        </p>

      </div>

      {/* ==================================
      Grid
      ================================== */}

      <div
        className={
          styles.grid
        }
      >

        {products
          .slice(0, 8)
          .map((

            p: any,

            index: number

          ) => {

            const title =

              p.shortTitle
              || p.name
              || 'おすすめPC'

            const image =

              p.image_url
              || '/no-image.png'

            const price =

              typeof p.price ===
              'number'

                ? `¥${p.price.toLocaleString()}`

                : null

            const reasons =

              formatMatchReason(
                p.match_reason
              )

            const grouped =

              p.grouped_attributes
              || {}

            return (

              <Link
                key={
                  p.unique_id
                }

                href={
                  `/product/${p.unique_id}`
                }

                className={
                  styles.card
                }
              >

                {/* ================= */}
                {/* Image */}
                {/* ================= */}

                <div
                  className={
                    styles.imageWrap
                  }
                >

                  <img
                    src={image}

                    alt={title}

                    className={
                      styles.image
                    }
                  />

                  <div
                    className={
                      styles.imageOverlay
                    }
                  />

                  <div
                    className={
                      styles.badgeWrap
                    }
                  >

                    <SimilarityBadge
                      index={index}
                    />

                  </div>

                </div>

                {/* ================= */}
                {/* Content */}
                {/* ================= */}

                <div
                  className={
                    styles.content
                  }
                >

                  {price && (

                    <div
                      className={
                        styles.price
                      }
                    >

                      {price}

                    </div>

                  )}

                  <h3
                    className={
                      styles.cardTitle
                    }
                  >

                    {title}

                  </h3>

                  {reasons.length > 0 && (

                    <div
                      className={
                        styles.reasonList
                      }
                    >

                      {reasons.map((

                        reason,

                        idx

                      ) => (

                        <div
                          key={idx}

                          className={
                            styles.reasonChip
                          }
                        >

                          {reason}

                        </div>

                      ))}

                    </div>

                  )}

                  <SemanticGroups
                    grouped={grouped}
                  />

                </div>

              </Link>

            )
          })}

      </div>

    </section>

  )
}