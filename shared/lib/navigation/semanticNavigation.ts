
// /home/maya/shin-dev/shin-vps/shared/lib/navigation/semanticNavigation.ts

import type {

  SemanticNavigation,

  SemanticNavigationGroup,

  SemanticNavigationItem,

} from './navigationTypes'

/* =========================================
🔥 Semantic
========================================= */

import type {

  SemanticGroupType,

} from '@/shared/lib/semantic'

/* =========================================
🔥 Safe Array
========================================= */

function safeArray<T = any>(
  value: unknown
): T[] {

  return Array.isArray(
    value
  )

    ? value

    : []
}

/* =========================================
🔥 Create Navigation Item
========================================= */

export function
createNavigationItem(
  item: Partial<
    SemanticNavigationItem
  >
): SemanticNavigationItem {

  return {

    // -----------------------------------
    // identity
    // -----------------------------------

    label:

      typeof item.label
        === 'string'

          ? item.label

          : '',

    slug:

      typeof item.slug
        === 'string'

          ? item.slug

          : '',

    href:

      typeof item.href
        === 'string'

          ? item.href

          : '#',

    // -----------------------------------
    // optional
    // -----------------------------------

    description:

      typeof item.description
        === 'string'

          ? item.description

          : undefined,

    icon:

      typeof item.icon
        === 'string'

          ? item.icon

          : undefined,

    image:

      typeof item.image
        === 'string'

          ? item.image

          : undefined,

    // -----------------------------------
    // metrics
    // -----------------------------------

    count:

      typeof item.count
        === 'number'

          ? item.count

          : 0,

    semantic_weight:

      typeof item.semantic_weight
        === 'number'

          ? item.semantic_weight

          : 0,

    order:

      typeof item.order
        === 'number'

          ? item.order

          : 0,

    // -----------------------------------
    // semantic
    // -----------------------------------

    semantic_role:

      item.semantic_role
      || 'supportive',
  }
}

/* =========================================
🔥 Create Navigation Group
========================================= */

export function
createNavigationGroup(
  group: Partial<
    SemanticNavigationGroup
  >
): SemanticNavigationGroup {

  return {

    // -----------------------------------
    // identity
    // -----------------------------------

    key:

      typeof group.key
        === 'string'

          ? group.key

          : '',

    type:

      (
        typeof group.type
          === 'string'

            ? group.type

            : 'unknown'

      ) as SemanticGroupType,

    title:

      typeof group.title
        === 'string'

          ? group.title

          : '',

    // -----------------------------------
    // optional
    // -----------------------------------

    description:

      typeof group.description
        === 'string'

          ? group.description

          : undefined,

    // -----------------------------------
    // items
    // -----------------------------------

    items:

      safeArray(
        group.items
      ).map(
        createNavigationItem
      ),
  }
}

/* =========================================
🔥 Create Semantic Navigation
========================================= */

export function
createSemanticNavigation(
  groups:
    SemanticNavigationGroup[]
): SemanticNavigation {

  return {

    groups:

      safeArray(
        groups
      ).map(
        createNavigationGroup
      ),
  }
}

/* =========================================
🔥 Empty Navigation
========================================= */

export function
createEmptyNavigation():
SemanticNavigation {

  return {
    groups: [],
  }
}

/* =========================================
🔥 Navigation Guard
========================================= */

export function
hasNavigationGroups(
  navigation?:
    SemanticNavigation
) {

  return Boolean(

    navigation
      ?.groups
      ?.length
  )
}

