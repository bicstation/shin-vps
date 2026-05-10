// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/utils/semantic-role.ts

import type {
  SemanticRole,
} from '../types/semantic'

/* =========================================
🔥 Semantic Role Priority
========================================= */

export const SEMANTIC_ROLE_PRIORITY:
  Record<
    SemanticRole,
    number
  > = {

  highlight: 100,

  primary: 80,

  secondary: 60,

  supportive: 40,
}

/* =========================================
🔥 Semantic Role Class
========================================= */

export function getSemanticRoleClass(
  role?: SemanticRole
) {

  switch (role) {

    case 'highlight':
      return 'highlight'

    case 'primary':
      return 'primary'

    case 'secondary':
      return 'secondary'

    case 'supportive':
      return 'supportive'

    default:
      return 'default'
  }
}

/* =========================================
🔥 Highlight Check
========================================= */

export function isHighlightedRole(
  role?: SemanticRole
) {

  return role ===
    'highlight'
}

/* =========================================
🔥 Role Label
========================================= */

export function getSemanticRoleLabel(
  role?: SemanticRole
) {

  switch (role) {

    case 'highlight':
      return '注目'

    case 'primary':
      return '人気'

    case 'secondary':
      return 'おすすめ'

    case 'supportive':
      return '関連'

    default:
      return '一般'
  }
}

/* =========================================
🔥 Role Color
========================================= */

export function getSemanticRoleColor(
  role?: SemanticRole
) {

  switch (role) {

    case 'highlight':
      return '#ff4d6d'

    case 'primary':
      return '#4dabf7'

    case 'secondary':
      return '#82c91e'

    case 'supportive':
      return '#868e96'

    default:
      return '#ced4da'
  }
}

/* =========================================
🔥 Semantic Role Sorting
========================================= */

export function sortBySemanticRole<
  T extends {
    semantic_role?: SemanticRole
  }
>(
  items: T[]
) {

  return [...items].sort(
    (a, b) => {

      const priorityA =
        SEMANTIC_ROLE_PRIORITY[
          a.semantic_role
          || 'supportive'
        ]

      const priorityB =
        SEMANTIC_ROLE_PRIORITY[
          b.semantic_role
          || 'supportive'
        ]

      return (
        priorityB
        -
        priorityA
      )
    }
  )
}

/* =========================================
🔥 Semantic Weight Sorting
========================================= */

export function sortBySemanticWeight<
  T extends {
    semantic_weight?: number
  }
>(
  items: T[]
) {

  return [...items].sort(
    (a, b) => (

      (b.semantic_weight || 0)
      -
      (a.semantic_weight || 0)

    )
  )
}

/* =========================================
🔥 Semantic Navigation Sort
========================================= */

export function sortSemanticNavigation<
  T extends {
    order?: number
    semantic_role?: SemanticRole
    semantic_weight?: number
  }
>(
  items: T[]
) {

  return [...items].sort(
    (a, b) => {

      // =================================
      // 1. Explicit Order
      // =================================

      const orderA =
        a.order || 0

      const orderB =
        b.order || 0

      if (
        orderA !== orderB
      ) {

        return (
          orderB
          -
          orderA
        )

      }

      // =================================
      // 2. Semantic Role
      // =================================

      const roleA =
        SEMANTIC_ROLE_PRIORITY[
          a.semantic_role
          || 'supportive'
        ]

      const roleB =
        SEMANTIC_ROLE_PRIORITY[
          b.semantic_role
          || 'supportive'
        ]

      if (
        roleA !== roleB
      ) {

        return (
          roleB
          -
          roleA
        )

      }

      // =================================
      // 3. Semantic Weight
      // =================================

      return (

        (b.semantic_weight || 0)

        -

        (a.semantic_weight || 0)

      )
    }
  )
}

/* =========================================
🔥 Semantic Navigation Normalize
========================================= */

export function normalizeSemanticItems<
  T extends {
    name?: string
    slug?: string
  }
>(
  items: T[]
) {

  return items.filter(
    item => (

      !!item?.name
      &&
      !!item?.slug

    )
  )
}

/* =========================================
🔥 Semantic Navigation Prepare
========================================= */

export function prepareSemanticNavigation<
  T extends {
    order?: number
    semantic_role?: SemanticRole
    semantic_weight?: number
    name?: string
    slug?: string
  }
>(
  items: T[]
) {

  return sortSemanticNavigation(

    normalizeSemanticItems(
      items
    )

  )
}