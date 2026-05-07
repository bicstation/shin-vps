import Link from 'next/link'

import {
  fetchRelatedProducts,
} from '@/shared/lib/api/django/pc/stats'

import SemanticSection
  from '@/shared/components/semantic/SemanticSection'

import styles
  from './RelatedProducts.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {
  product: any
}

/* =========================================
🔥 Match Reason
========================================= */

function formatMatchReason(
  reasons: any
): string[] {

  // --------------------------------
  // normalize
  // --------------------------------
  let list: string[] = []

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

  // --------------------------------
  // semantic map
  // --------------------------------
  const map:
    Record<
      string,
      string
    > = {

    price:
      '同価格帯で比較しやすい',

    gpu:
      '同等GPU semantic',

    usage:
      '同じ用途 semantic',

    creator:
      'creator workload一致',

    gaming:
      'gaming semantic一致',

    balance:
      '構成バランスが近い',
  }

  return list
    .map(
      key =>
        map[key]
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

  // Top
  if (index === 0) {

    return (
      <div
        className={
          styles.topBadge
        }
      >
        TOP SIMILAR
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
        関連semantic構成はありません
      </p>

    </div>
  )
}

/* =========================================
🔥 Component
========================================= */

export default async function RelatedProducts({
  product,
}: Props) {

  // --------------------------------
  // Safety
  // --------------------------------
  if (
    !product?.unique_id
  ) {
    return null
  }

  // --------------------------------
  // Fetch
  // --------------------------------
  const related =
    await fetchRelatedProducts(
      product.unique_id
    )

  // --------------------------------
  // Empty
  // --------------------------------
  if (
    !related?.length
  ) {
    return <EmptyState />
  }

  return (
    <section
      className={
        styles.section
      }
    >

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
          Semantic Similarity
        </div>

        <h2
          className={
            styles.title
          }
        >
          似たおすすめ構成
        </h2>

        <p
          className={
            styles.description
          }
        >
          同じ semantic intent /
          workload /
          recommendation balance
          を持つ関連構成。
        </p>

      </div>

      {/* ========================= */}
      {/* Grid */}
      {/* ========================= */}

      <div
        className={
          styles.grid
        }
      >

        {related
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
              p
                ?.grouped_attributes
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
                {/* image */}
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
                {/* content */}
                {/* ================= */}

                <div
                  className={
                    styles.content
                  }
                >

                  {/* price */}
                  {price && (

                    <div
                      className={
                        styles.price
                      }
                    >
                      {price}
                    </div>

                  )}

                  {/* title */}
                  <h3
                    className={
                      styles.cardTitle
                    }
                  >
                    {title}
                  </h3>

                  {/* reasons */}
                  {reasons.length > 0 && (

                    <div
                      className={
                        styles.reasonList
                      }
                    >

                      {reasons.map(
                        (
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

                        )
                      )}

                    </div>

                  )}

                  {/* semantic groups */}
                  <div
                    className={
                      styles.semanticGroups
                    }
                  >

                    {Object.entries(
                      grouped
                    )
                      .slice(0, 2)
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

                  {/* CTA */}
                  <div
                    className={
                      styles.cta
                    }
                  >
                    →
                    詳細を見る
                  </div>

                </div>

              </Link>
            )
          })}

      </div>

    </section>
  )
}