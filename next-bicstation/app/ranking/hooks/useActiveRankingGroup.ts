// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/hooks/useActiveRankingGroup.ts
// ============================================================================

'use client'

import {
  useMemo,
  useState,
} from 'react'

type Params = {
  groupedAttributes: any
  initialGroup: string | null
}

/* ============================================================================
🔥 Active Ranking Group Runtime Hook
============================================================================ */

export function useActiveRankingGroup({
  groupedAttributes,
  initialGroup,
}: Params) {

  /* ==========================================================================
  🔥 Active State
  ========================================================================== */

  const [activeGroup, setActiveGroup] =
    useState(initialGroup)

  /* ==========================================================================
  🔥 Active Runtime
  ========================================================================== */

  const activeData =
    groupedAttributes?.[
      activeGroup || ''
    ]

  const meta =
    activeData?.meta || {}

  const items =
    activeData?.items || []

  /* ==========================================================================
  🔥 Sorted Items
  ========================================================================== */

  const sortedItems =
    useMemo(
      () =>
        [...items]
          .sort(
            (a, b) =>
              (b.semantic_weight || 0)
              -
              (a.semantic_weight || 0)
          ),
      [items]
    )

  /* ==========================================================================
  🔥 Return
  ========================================================================== */

  return {

    activeGroup,

    setActiveGroup,

    activeData,

    meta,

    items,

    sortedItems,

  }
}