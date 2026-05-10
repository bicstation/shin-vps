// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/page.tsx

// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import RankingHero
  from './components/RankingHero'

import SemanticSection
  from './components/SemanticSection'

import FinderCTA
  from './components/FinderCTA'

import EmptyState
  from './components/EmptyState'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './page.module.css'

/* =========================================
🔥 Dynamic
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Ranking Page
========================================= */

export default async function
RankingPage() {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    `${process.env.INTERNAL_API_URL}/general/pc-sidebar-stats/`

  // ======================================
  // Fetch
  // ======================================

  let sidebar = null

  try {

    const response =

      await fetch(
        endpoint,
        {
          cache:
            'no-store',
        },
      )

    sidebar =
      await response.json()

  } catch (error) {

    console.error(error)

  }

  // ======================================
  // Normalize
  // ======================================

  const semanticGroups =

    Object.entries(
      sidebar || {}
    ).filter(
      ([, items]) => (

        Array.isArray(items)
        &&
        items.length > 0

      )
    )

  // ======================================
  // Empty
  // ======================================

  const isEmpty =

    semanticGroups.length === 0

  // ======================================
  // Hero Labels
  // ======================================

  const heroLabels =

    semanticGroups.flatMap(
      ([, items]) => (

        items.map(
          item => item.name
        )

      )
    )

  // ======================================
  // Group Title
  // ======================================

  function getGroupTitle(
    key: string
  ) {

    const map = {

      usage:
        '用途別ランキング',

      gpu:
        'GPUランキング',

      maker:
        'メーカー別ランキング',

      memory:
        'メモリ別ランキング',

      storage:
        'ストレージ別ランキング',

      cpu:
        'CPU別ランキング',

      ai:
        'AI用途ランキング',

      workload:
        '作業用途ランキング',

      panel:
        'ディスプレイ別ランキング',

      resolution:
        '解像度別ランキング',
    }

    return (
      map[key]
      || `${key} ランキング`
    )
  }

  // ======================================
  // Group Description
  // ======================================

  function getGroupDescription(
    key: string
  ) {

    const map = {

      usage:
        'ゲーム・AI・動画編集など、用途からPCを探せます。',

      gpu:
        'RTX 4060・RTX 4070など、GPU性能から比較できます。',

      maker:
        '人気メーカー別に比較できます。',

      memory:
        '16GB・32GB・64GBなど、メモリ容量から探せます。',

      storage:
        'SSD容量から比較できます。',

      cpu:
        'CPU性能から比較できます。',

      ai:
        'AI画像生成やLLM向けPCを探せます。',

      workload:
        '作業内容から最適な構成を探せます。',

      panel:
        '液晶タイプから比較できます。',

      resolution:
        '4K・WQHDなど解像度から比較できます。',
    }

    return (
      map[key]
      || `${key} semantic navigation`
    )
  }

  // ======================================
  // Render
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      {/* ================================= */}
      {/* Hero */}
      {/* ================================= */}

      <RankingHero

        semanticLabels={
          heroLabels
        }

      />

      {/* ================================= */}
      {/* Empty */}
      {/* ================================= */}

      {isEmpty && (

        <EmptyState />

      )}

      {/* ================================= */}
      {/* Semantic Sections */}
      {/* ================================= */}

      {!isEmpty && (

        <div
          className={
            styles.sections
          }
        >

          {semanticGroups.map(
            (
              [key, items]
            ) => (

              <SemanticSection

                key={key}

                group={{

                  key,

                  label:
                    key.toUpperCase(),

                  title:
                    getGroupTitle(key),

                  description:
                    getGroupDescription(key),

                  items:
                    items.map(
                      item => ({

                        ...item,

                        href:
                          `/ranking/${item.slug}`,
                      })
                    ),

                }}

              />

            )
          )}

        </div>

      )}

      {/* ================================= */}
      {/* Finder CTA */}
      {/* ================================= */}

      <FinderCTA />

    </main>

  )
}