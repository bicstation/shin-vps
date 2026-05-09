
// /home/maya/shin-dev/shin-vps/shared/lib/navigation/transformSidebarStats.ts

/* =========================================
🔥 Semantic
========================================= */

import {

  normalizeSemanticPayload,

  resolveSemanticPresentation,

} from '@/shared/lib/semantic'

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
🔥 Transform Sidebar Stats
========================================= */

export function
transformSidebarStats(
  payload?: unknown
): SemanticNavigation {

  // ======================================
  // normalize semantic payload
  // ======================================

  const normalized =
    normalizeSemanticPayload(
      payload
    )

  // ======================================
  // navigation groups
  // ======================================

  const groups =

    normalized
      .navigation_groups
      .map(group => (

        createNavigationGroup({

          key:
            group.key,

          type:
            group.key,

          title:
            group.title,

          description:
            `${group.title} semantic group`,

          items:

            group.attributes
              .map(attribute => {

                const presentation =

                  resolveSemanticPresentation(
                    attribute
                  )

                return (
                  createNavigationItem({

                    label:
                      presentation.label,

                    slug:
                      presentation.slug,

                    href:
                      `/ranking/${presentation.slug}`,

                    count:
                      attribute?.count || 0,

                    icon:
                      presentation.icon,

                    semantic_role:

                      attribute
                        ?.semantic_role

                        || 'supportive',

                    semantic_weight:

                      attribute
                        ?.semantic_weight

                        || 0,
                  })
                )
              }),
        })
      ))

  // ======================================
  // semantic navigation
  // ======================================

  return createSemanticNavigation(
    groups
  )
}

