/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link from 'next/link'

import {
  fetchSidebarStats,
} from '@/shared/lib/api/django/pc/stats'

import styles from './page.module.css'

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Section Title
========================================= */

function SectionTitle({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description?: string
}) {

  return (
    <div
      className={
        styles.sectionHeader
      }
    >

      <div
        className={
          styles.sectionLabel
        }
      >
        {label}
      </div>

      <h2
        className={
          styles.sectionTitle
        }
      >
        {title}
      </h2>

      {description && (
        <p
          className={
            styles.sectionDescription
          }
        >
          {description}
        </p>
      )}

    </div>
  )
}

/* =========================================
🔥 Semantic Card Link
========================================= */

function SemanticCard({
  href,
  icon,
  title,
  description,
  count,
  emphasis = false,
}: {
  href: string
  icon?: string
  title: string
  description?: string
  count?: number
  emphasis?: boolean
}) {

  return (
    <Link
      href={href}

      prefetch={false}

      className={
        emphasis
          ? styles.semanticCardStrong
          : styles.semanticCard
      }
    >

      <div
        className={
          styles.cardTop
        }
      >

        <div
          className={
            styles.cardIcon
          }
        >
          {icon}
        </div>

        {typeof count ===
          'number' && (
          <div
            className={
              styles.cardCount
            }
          >
            {count}
          </div>
        )}

      </div>

      <div
        className={
          styles.cardBody
        }
      >

        <div
          className={
            styles.cardTitle
          }
        >
          {title}
        </div>

        {description && (
          <div
            className={
              styles.cardDescription
            }
          >
            {description}
          </div>
        )}

      </div>

      <div
        className={
          styles.cardArrow
        }
      >
        →
      </div>

    </Link>
  )
}

/* =========================================
🔥 Quick Semantic Ranking
========================================= */

const QUICK_RANKINGS = [

  {
    href:
      '/ranking/score',

    icon:
      '🏆',

    title:
      '総合ランキング',

    description:
      'semantic balance が最も高い構成',

    emphasis:
      true,
  },

  {
    href:
      '/ranking/usage-gaming',

    icon:
      '🎮',

    title:
      'ゲーミングPC',

    description:
      'high FPS / RTX gaming semantic',
  },

  {
    href:
      '/ranking/usage-creator',

    icon:
      '🎬',

    title:
      '動画編集・Creator',

    description:
      'creator workload optimized',
  },

  {
    href:
      '/ranking/usage-ai',

    icon:
      '⚡',

    title:
      'AI用途',

    description:
      'AI semantic / local AI workload',
  },

  {
    href:
      '/ranking/usage-work',

    icon:
      '💼',

    title:
      'ビジネス用途',

    description:
      'stable workflow semantic',
  },

  {
    href:
      '/ranking/price-low',

    icon:
      '💰',

    title:
      'コスパ重視',

    description:
      'price-performance optimized',
  },

]

/* =========================================
🔥 Semantic Description
========================================= */

function getGpuDescription(
  name: string
) {

  const lower =
    name?.toLowerCase?.() || ''

  if (
    lower.includes('4090')
  ) {
    return '4K / AI / ultra gaming'
  }

  if (
    lower.includes('4080')
  ) {
    return 'high-end gaming semantic'
  }

  if (
    lower.includes('4070')
  ) {
    return '1440p gaming optimized'
  }

  if (
    lower.includes('4060')
  ) {
    return 'gaming balance semantic'
  }

  return 'GPU performance semantic'
}

function getMakerDescription(
  name: string
) {

  const lower =
    name?.toLowerCase?.() || ''

  if (
    lower.includes('asus')
  ) {
    return 'gaming / creatorブランド'
  }

  if (
    lower.includes('dell')
  ) {
    return 'business stability semantic'
  }

  if (
    lower.includes('hp')
  ) {
    return 'balance workstation semantic'
  }

  if (
    lower.includes('lenovo')
  ) {
    return 'workload productivity semantic'
  }

  return 'brand recommendation semantic'
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
          データを取得できません
        </h2>

        <p
          className={
            styles.emptyText
          }
        >
          semantic API /
          sidebar stats /
          backend authority
          を確認してください。
        </p>

      </div>

    </div>
  )
}

/* =========================================
🔥 Main Page
========================================= */

export default async function RankingIndexPage() {

  // --------------------------------
  // Fetch
  // --------------------------------
  const stats =
    await fetchSidebarStats()

  // --------------------------------
  // Empty
  // --------------------------------
  if (!stats) {
    return <EmptyState />
  }

  // --------------------------------
  // Split
  // --------------------------------
  const gpu =
    stats?.gpu || []

  const makers =
    stats?.makers || []

  return (
    <main
      className={
        styles.page
      }
    >

      <div
        className={
          styles.container
        }
      >

        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}

        <section
          className={
            styles.hero
          }
        >

          <div
            className={
              styles.heroLabel
            }
          >
            Semantic Ranking Explorer
          </div>

          <h1
            className={
              styles.heroTitle
            }
          >
            用途・性能・semanticから
            最適な1台を探す
          </h1>

          <p
            className={
              styles.heroDescription
            }
          >
            usage /
            GPU /
            maker /
            AI /
            workload /
            recommendation balance
            を横断探索。
          </p>

        </section>

        {/* ================================= */}
        {/* QUICK RANKINGS */}
        {/* ================================= */}

        <section
          className={
            styles.section
          }
        >

          <SectionTitle
            label="Semantic Rankings"
            title="人気ランキング"
            description="
            recommendation /
            intent /
            workload semantic
            から探索。
            "
          />

          <div
            className={
              styles.quickGrid
            }
          >

            {QUICK_RANKINGS.map(
              item => (

                <SemanticCard
                  key={item.href}

                  href={item.href}

                  icon={item.icon}

                  title={item.title}

                  description={
                    item.description
                  }

                  emphasis={
                    item.emphasis
                  }
                />

              )
            )}

          </div>

        </section>

        {/* ================================= */}
        {/* GPU */}
        {/* ================================= */}

        {gpu.length > 0 && (

          <section
            className={
              styles.section
            }
          >

            <SectionTitle
              label="GPU Semantic"
              title="GPU性能から探す"
              description="
              gaming /
              creator /
              AI workload
              に最適なGPU semantic。
              "
            />

            <div
              className={
                styles.semanticGrid
              }
            >

              {gpu
                .slice(0, 12)
                .map((g: any) => {

                  if (!g?.slug) {
                    return null
                  }

                  return (
                    <SemanticCard
                      key={g.slug}

                      href={
                        `/ranking/${g.slug}`
                      }

                      icon="⚡"

                      title={
                        g.name
                      }

                      description={
                        getGpuDescription(
                          g.name
                        )
                      }

                      count={
                        g.count
                      }
                    />
                  )
                })}

            </div>

          </section>

        )}

        {/* ================================= */}
        {/* MAKERS */}
        {/* ================================= */}

        {makers.length > 0 && (

          <section
            className={
              styles.section
            }
          >

            <SectionTitle
              label="Brand Semantic"
              title="メーカーから探す"
              description="
              brand philosophy /
              workload /
              recommendation semantic
              を比較。
              "
            />

            <div
              className={
                styles.semanticGrid
              }
            >

              {makers
                .slice(0, 12)
                .map((m: any) => {

                  if (!m?.slug) {
                    return null
                  }

                  return (
                    <SemanticCard
                      key={m.slug}

                      href={
                        `/ranking/${m.slug}`
                      }

                      icon="🏢"

                      title={
                        m.name
                      }

                      description={
                        getMakerDescription(
                          m.name
                        )
                      }

                      count={
                        m.count
                      }
                    />
                  )
                })}

            </div>

          </section>

        )}

        {/* ================================= */}
        {/* FINDER */}
        {/* ================================= */}

        <section
          className={
            styles.finderSection
          }
        >

          <div
            className={
              styles.finderCard
            }
          >

            <div
              className={
                styles.finderLabel
              }
            >
              AI Semantic Finder
            </div>

            <h2
              className={
                styles.finderTitle
              }
            >
              あなたの用途から
              semantic recommendation
            </h2>

            <p
              className={
                styles.finderDescription
              }
            >
              gaming /
              creator /
              AI /
              workload /
              budget
              をもとに
              recommendation。
            </p>

            <Link
              href="/pc-finder"

              className={
                styles.finderButton
              }
            >
              →
              semantic finder を使う
            </Link>

          </div>

        </section>

      </div>

    </main>
  )
}