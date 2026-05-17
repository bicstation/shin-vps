// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingRuntime.tsx
// ============================================================================

'use client'

import type {
  CSSProperties,
} from 'react'

import {
  useMemo,
  useState,
} from 'react'

import styles from '../RankingPage.module.css'

import {
  RankingHero,
  RankingTabs,
  RankingActiveHeader,
  RankingCardGrid,
} from './'

import {
  PRESENTATION_COPY,
} from '../lib/presentationCopy'

import {
  getRuntimeTheme,
} from '../lib/runtimeTheme'

type Props = {
  groupedAttributes: any
  groupKeys: string[]
  initialGroup: string | null
}

/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

export default function RankingRuntime({
  groupedAttributes,
  groupKeys,
  initialGroup,
}: Props) {

  /* ==========================================================================
  🔥 Runtime State
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
  🔥 Presentation Runtime
  ========================================================================== */

  const presentation =
    PRESENTATION_COPY[
      activeGroup || ''
    ]

  /* ==========================================================================
  🔥 Runtime Theme
  ========================================================================== */

  const runtimeTheme =
    getRuntimeTheme(
      activeGroup
    )

  /* ==========================================================================
  🔥 Sorted Runtime
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
  🔥 Runtime CSS Variables
  ========================================================================== */

  const runtimeStyle: CSSProperties = {

    '--runtime-glow':
      runtimeTheme.glow,

    '--runtime-accent':
      runtimeTheme.accent,

    '--runtime-surface':
      runtimeTheme.surface,

    '--runtime-border':
      runtimeTheme.border,

  } as CSSProperties

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <main
      className={styles.page}
      style={runtimeStyle}
      data-runtime-group={activeGroup || ''}
    >

      {/* ================================================================
      HERO
      ================================================================ */}

      <RankingHero />

      {/* ================================================================
      TABS
      ================================================================ */}

      <RankingTabs
        groupedAttributes={groupedAttributes}
        groupKeys={groupKeys}
        activeGroup={activeGroup}
        onChangeGroup={setActiveGroup}
      />

      {/* ================================================================
      ACTIVE HEADER
      ================================================================ */}

      <RankingActiveHeader
        meta={meta}
        presentation={presentation}
      />

      {/* ================================================================
      CARD GRID
      ================================================================ */}

      <RankingCardGrid
        items={sortedItems}
      />

    </main>

  )
}