// @ts-nocheck

/* =========================================
🔥 API
========================================= */

import {
  fetchSidebar,
} from '@/shared/lib/api/django/pc'

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
🔥 Types
========================================= */

import type {
  SemanticAttribute,
} from './types/semantic'

/* =========================================
🔥 Utils
========================================= */

import {
  prepareSemanticNavigation,
} from './utils/semantic-role'

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
🔥 Group Title
========================================= */

function getGroupTitle(
  key: string
) {

  const map = {

    usage:
      '用途別ランキング',

    gpu:
      'GPUランキング',

    cpu:
      'CPUランキング',

    maker:
      'メーカー別ランキング',

    memory:
      'メモリ別ランキング',

    storage:
      'ストレージ別ランキング',

    resolution:
      '解像度別ランキング',

    panel:
      'ディスプレイ別ランキング',

    workload:
      '作業用途ランキング',

    ai:
      'AI用途ランキング',
  }

  return (
    map[key]
    || `${key} ランキング`
  )
}

/* =========================================
🔥 Group Description
========================================= */

function getGroupDescription(
  key: string
) {

  const map = {

    usage:
      'ゲーム・動画編集・AI画像生成など、用途から最適なPCを探せます。',

    gpu:
      'RTX 4060・RTX 4070・RTX 4080など、GPU性能から比較できます。',

    cpu:
      'CPU性能からPCを比較できます。',

    maker:
      '人気メーカー別に比較できます。',

    memory:
      '16GB・32GB・64GBなど、メモリ容量から比較できます。',

    storage:
      'SSD容量やストレージ性能から比較できます。',

    resolution:
      'フルHD・WQHD・4Kなど解像度から比較できます。',

    panel:
      '液晶タイプやディスプレイ性能から比較できます。',

    workload:
      '作業内容から最適なPCを探せます。',

    ai:
      'AI画像生成やLLM用途に適したPCを探せます。',
  }

  return (
    map[key]
    || `${key} semantic ranking`
  )
}

/* =========================================
🔥 Ranking Page
========================================= */

export default async function
RankingPage() {

  /* ======================================
  FETCH SIDEBAR
  ====================================== */

  const sidebar =

    await fetchSidebar()

  /* ======================================
  DEBUG
  ====================================== */

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 RANKING PAGE COMPONENTS'
  )

  console.log({

    RankingHero,

    SemanticSection,

    FinderCTA,

    EmptyState,

  })

  console.log(
    '🔥 SIDEBAR'
  )

  console.log(
    JSON.stringify(
      sidebar,
      null,
      2
    )
  )

  console.log(
    '🔥 =====================================\n'
  )

  /* ======================================
  SEMANTIC GROUPS
  ====================================== */

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

  /* ======================================
  EMPTY
  ====================================== */

  const isEmpty =

    semanticGroups.length === 0

  /* ======================================
  HERO SEMANTIC LABELS
  ====================================== */

  const heroSemanticLabels =

    semanticGroups.flatMap(
      ([, items]) => (

        prepareSemanticNavigation(
          items as SemanticAttribute[]
        ).map(
          item => ({

            name:
              item.name,

            slug:
              item.slug,

          })
        )

      )
    )

  /* ======================================
  RENDER
  ====================================== */

  return (

    <main
      className={
        styles.page
      }
    >

      {/* =================================
      HERO
      semantic discovery
      ================================= */}

      <RankingHero

        semanticLabels={
          heroSemanticLabels
        }

      />

      {/* =================================
      EMPTY
      ================================= */}

      {isEmpty && (

        <EmptyState />

      )}

      {/* =================================
      SEMANTIC SECTIONS
      ================================= */}

      {!isEmpty && (

        <div
          className={
            styles.sections
          }
        >

          {semanticGroups.map(
            (
              [key, items]
            ) => {

              const normalizedItems =

                prepareSemanticNavigation(
                  items as SemanticAttribute[]
                )

              return (

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

                      normalizedItems.map(
                        item => ({

                          ...item,

                          href:
                            `/ranking/${item.slug}`,

                        })
                      ),

                  }}

                />

              )
            }
          )}

        </div>

      )}

      {/* =================================
      FINDER CTA
      ================================= */}

      <FinderCTA />

    </main>

  )
}