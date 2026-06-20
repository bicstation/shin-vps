// ============================================================================
// FILE:
// /app/discover/utils/groupNavigation.ts
// ============================================================================

/* ============================================================================
🔥 Types
============================================================================ */

import type {

  NavigationItem,

} from '../types/discover'

/* ============================================================================
🔥 Grouped Navigation
============================================================================ */

export type GroupedNavigation =

  Record<
    string,
    NavigationItem[]
  >

/* ============================================================================
🔥 Group Navigation
============================================================================ */

/**
 * navigation
 *
 * ↓
 *
 * parent_group
 *
 * ↓
 *
 * grouped navigation
 */

export function groupNavigation(

  navigation:
    NavigationItem[]

): GroupedNavigation {

  return navigation.reduce(

    (
      groups,
      item
    ) => {

      const key =
        item.parent_group

      if (
        !groups[key]
      ) {

        groups[key] = []

      }

      groups[key].push(
        item
      )

      return groups

    },

    {} as GroupedNavigation

  )

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default groupNavigation