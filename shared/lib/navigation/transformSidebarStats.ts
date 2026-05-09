// /home/maya/shin-dev/shin-vps/shared/lib/navigation/transformSidebarStats.ts

/* =========================================
🔥 Navigation
========================================= */

import {

  createNavigationGroup,

  createNavigationItem,

  createSemanticNavigation,

} from './semanticNavigation'

import type {

  SemanticNavigation,

} from './navigationTypes'

/* =========================================
🔥 Sidebar Payload
========================================= */

type SidebarAttribute = {

  name?: string

  slug?: string

  count?: number
}

type SidebarStatsPayload = {

  gpu?: SidebarAttribute[]

  maker_counts?: SidebarAttribute[]
}

/* =========================================
🔥 Group Description
========================================= */

function resolveGroupDescription(
  key: string
) {

  switch (key) {

    case 'gpu':

      return (
        'グラフィック性能から探す'
      )

    case 'maker':

      return (
        '人気メーカーから探す'
      )

    default:

      return (
        'おすすめカテゴリ'
      )
  }
}

/* =========================================
🔥 Safe Array
========================================= */

function safeArray<T>(
  value?: T[]
): T[] {

  return Array.isArray(
    value
  )

    ? value

    : []
}

/* =========================================
🔥 Transform Sidebar Stats
========================================= */

export function
transformSidebarStats(
  payload?: SidebarStatsPayload
): SemanticNavigation {

  // ======================================
  // Safe Payload
  // ======================================

  const gpu = safeArray(
    payload?.gpu
  )

  const makerCounts = safeArray(
    payload?.maker_counts
  )

  // ======================================
  // Navigation Groups
  // ======================================

  const groups = [

    // ====================================
    // GPU GROUP
    // ====================================

    createNavigationGroup({

      key:
        'gpu',

      type:
        'gpu',

      title:
        'GPU性能から選ぶ',

      description:
        resolveGroupDescription(
          'gpu'
        ),

      items:

        gpu.map(attribute => {

          const slug =
            attribute?.slug || ''

          const label =
            attribute?.name || ''

          return (

            createNavigationItem({

              label,

              description:
                'ゲーム性能や映像処理性能から探す',

              slug,

              href:
                `/ranking/${slug}`,

              icon:
                '',

              count:
                attribute?.count || 0,
            })
          )
        }),
    }),

    // ====================================
    // MAKER GROUP
    // ====================================

    createNavigationGroup({

      key:
        'maker',

      type:
        'maker',

      title:
        'メーカーから選ぶ',

      description:
        resolveGroupDescription(
          'maker'
        ),

      items:

        makerCounts.map(attribute => {

          const slug =
            attribute?.slug || ''

          const label =
            attribute?.name || ''

          return (

            createNavigationItem({

              label,

              description:
                '人気メーカーから探す',

              slug,

              href:
                `/ranking/${slug}`,

              icon:
                '',

              count:
                attribute?.count || 0,
            })
          )
        }),
    }),
  ]

  // ======================================
  // Semantic Navigation
  // ======================================

  return createSemanticNavigation(
    groups
  )
}