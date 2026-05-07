/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link from 'next/link'

import HeroRankingCard
  from '@/shared/components/organisms/cards/HeroRankingCard'

import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import {
  fetchPCProductRanking,
} from '@/shared/lib/api/django/pc/stats'

import styles
  from './page.module.css'

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Intent Navigation
========================================= */

const INTENT_NAV = [

  {
    label: '🎮 ゲーム重視',
    slug: 'usage-gaming',
    description:
      '高FPS gaming semantic',
  },

  {
    label: '🎬 動画編集',
    slug: 'usage-creator',
    description:
      'creator workload向け',
  },

  {
    label: '⚡ AI用途',
    slug: 'usage-ai',
    description:
      'AI semantic optimized',
  },

  {
    label: '💼 仕事用',
    slug: 'usage-work',
    description:
      'business workload向け',
  },

  {
    label: '💰 コスパ',
    slug: 'price-low',
    description:
      'price-performance重視',
  },

]

/* =========================================
🔥 Semantic Difference
========================================= */

function getSemanticDifference(
  product: any
) {

  const grouped =
    product
      ?.grouped_attributes
      || {}

  const usage =
    grouped
      ?.usage?.[0]
      ?.name

  const gpu =
    grouped
      ?.gpu?.[0]
      ?.name

  const maker =
    grouped
      ?.maker?.[0]
      ?.name

  return {
    usage,
    gpu,
    maker,
  }
}

/* =========================================
🔥 Page
========================================= */

export default async function HomePageMain() {

  // --------------------------------
  // Fetch
  // --------------------------------
  const products =
    await fetchPCProductRanking(
      'score'
    )

  // --------------------------------
  // Empty
  // --------------------------------
  if (
    !products?.length
  ) {

    return (
      <div
        className={
          styles.empty
        }
      >

        <div
          className={
            styles.emptyCard
          }
        >

          <h2
            className={
              styles.emptyTitle
            }
          >
            データ取得に失敗しました
          </h2>

          <p
            className={
              styles.emptyText
            }
          >
            semantic API /
            backend authority /
            ranking endpoint
            を確認してください。
          </p>

        </div>

      </div>
    )
  }

  // --------------------------------
  // Split
  // --------------------------------
  const top1 =
    products[0]

  const compareProducts =
    products.slice(1, 4)

  return (
    <main
      className={
        styles.page
      }
    >

      {/* ================================= */}
      {/* Top Navigation */}
      {/* ================================= */}

      <section
        className={
          styles.topNavSection
        }
      >

        <div
          className={
            styles.topNav
          }
        >

          <Link
            href="/ranking/score"
            className={
              styles.navItemActive
            }
          >
            🏆 総合
          </Link>

          <Link
            href="/ranking/usage-gaming"
            className={
              styles.navItem
            }
          >
            🎮 Gaming
          </Link>

          <Link
            href="/ranking/usage-creator"
            className={
              styles.navItem
            }
          >
            🎬 Creator
          </Link>

          <Link
            href="/ranking/usage-ai"
            className={
              styles.navItem
            }
          >
            ⚡ AI
          </Link>

          <Link
            href="/ranking/gpu-rtx-4070"
            className={
              styles.navItem
            }
          >
            RTX 4070
          </Link>

        </div>

      </section>

      {/* ================================= */}
      {/* Hero */}
      {/* ================================= */}

      {top1 && (

        <section
          className={
            styles.heroSection
          }
        >

          {/* semantic intro */}
          <div
            className={
              styles.heroIntro
            }
          >

            <div
              className={
                styles.heroLabel
              }
            >
              Semantic Recommendation
            </div>

            <h1
              className={
                styles.heroTitle
              }
            >
              今もっとも
              recommendation balance
              が高い構成
            </h1>

            <p
              className={
                styles.heroDescription
              }
            >
              gaming /
              creator /
              AI /
              workload /
              price-performance
              を総合分析。
            </p>

          </div>

          {/* hero card */}
          <HeroRankingCard
            product={top1}
          />

          {/* confidence */}
          <div
            className={
              styles.heroConfidence
            }
          >

            <div
              className={
                styles.confidenceCircle
              }
            >
              92%
            </div>

            <div
              className={
                styles.confidenceText
              }
            >

              <strong>
                semantic一致度
              </strong>

              <span>
                recommendation /
                workload /
                balance analysis
              </span>

            </div>

          </div>

        </section>

      )}

      {/* ================================= */}
      {/* Intent Finder */}
      {/* ================================= */}

      <section
        className={
          styles.intentSection
        }
      >

        <div
          className={
            styles.intentHeader
          }
        >

          <div
            className={
              styles.intentLabel
            }
          >
            Multi Intent Finder
          </div>

          <h2
            className={
              styles.intentTitle
            }
          >
            用途から探す
          </h2>

          <p
            className={
              styles.intentDescription
            }
          >
            semantic intent から
            最適構成を探索。
          </p>

        </div>

        <div
          className={
            styles.intentGrid
          }
        >

          {INTENT_NAV.map(
            intent => (

              <Link
                key={intent.slug}

                href={
                  `/ranking/${intent.slug}`
                }

                className={
                  styles.intentCard
                }
              >

                <div
                  className={
                    styles.intentCardTitle
                  }
                >
                  {intent.label}
                </div>

                <div
                  className={
                    styles.intentCardText
                  }
                >
                  {intent.description}
                </div>

              </Link>

            )
          )}

        </div>

      </section>

      {/* ================================= */}
      {/* Semantic Compare */}
      {/* ================================= */}

      {compareProducts.length > 0 && (

        <section
          className={
            styles.compareSection
          }
        >

          <div
            className={
              styles.compareHeader
            }
          >

            <div
              className={
                styles.compareLabel
              }
            >
              Semantic Comparison
            </div>

            <h2
              className={
                styles.compareTitle
              }
            >
              他のおすすめ構成
            </h2>

            <p
              className={
                styles.compareDescription
              }
            >
              semantic difference /
              workload /
              GPU balance
              を比較。
            </p>

          </div>

          <div
            className={
              styles.compareGrid
            }
          >

            {compareProducts.map((
              product,
              index
            ) => {

              const semantic =
                getSemanticDifference(
                  product
                )

              return (
                <div
                  key={
                    product.unique_id
                  }

                  className={
                    styles.compareItem
                  }
                >

                  {/* difference */}
                  <div
                    className={
                      styles.compareMeta
                    }
                  >

                    {semantic.usage && (

                      <div
                        className={
                          styles.compareChip
                        }
                      >
                        {semantic.usage}
                      </div>

                    )}

                    {semantic.gpu && (

                      <div
                        className={
                          styles.compareChipStrong
                        }
                      >
                        {semantic.gpu}
                      </div>

                    )}

                    {semantic.maker && (

                      <div
                        className={
                          styles.compareChip
                        }
                      >
                        {semantic.maker}
                      </div>

                    )}

                  </div>

                  <ProductCard
                    product={product}
                    rank={index + 2}
                  />

                </div>
              )
            })}

          </div>

        </section>

      )}

      {/* ================================= */}
      {/* Bottom CTA */}
      {/* ================================= */}

      <section
        className={
          styles.bottomSection
        }
      >

        <div
          className={
            styles.bottomCard
          }
        >

          <div
            className={
              styles.bottomLabel
            }
          >
            Semantic Ranking Explorer
          </div>

          <h2
            className={
              styles.bottomTitle
            }
          >
            すべてのsemanticランキングを見る
          </h2>

          <p
            className={
              styles.bottomDescription
            }
          >
            GPU /
            usage /
            maker /
            AI /
            recommendation
            を横断探索。
          </p>

          <Link
            href="/ranking"

            className={
              styles.bottomButton
            }
          >
            →
            semantic ranking を見る
          </Link>

        </div>

      </section>

    </main>
  )
}
