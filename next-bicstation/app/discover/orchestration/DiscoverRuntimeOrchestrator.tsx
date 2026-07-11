// ============================================================================
// FILE:
// /app/discover/orchestration/DiscoverRuntimeOrchestrator.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

/* ============================================================================
🔥 Runtime
============================================================================ */

import type {
  SemanticRuntime,
} from '@/shared/lib/api/django/pc/semantics'

/* ============================================================================
🔥 Components
============================================================================ */

import DiscoverHero
  from '../components/hero/DiscoverHero'

import UniverseTabs
  from '../components/tabs/UniverseTabs'

import UniverseGrid
  from '../components/cards/UniverseGrid'

import EmptyState
  from '../components/common/EmptyState'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/discover.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

interface DiscoverRuntimeProps {

  runtime: {

    semantic: SemanticRuntime

    semantic_runtime: boolean

    adaptive_runtime: boolean

  }

}

/* ============================================================================
🔥 Discover Runtime Orchestrator
============================================================================ */

export default function DiscoverRuntimeOrchestrator({

  runtime,

}: DiscoverRuntimeProps) {

  /* ==========================================================================
  🔥 Semantic Runtime
  ========================================================================== */

  const semantic =
    runtime.semantic

  /* ==========================================================================
  🔥 Active Universe
  ========================================================================== */

  const [

    activeUniverse,

    setActiveUniverse,

  ] = useState('')

  useEffect(() => {

    if (

      semantic.universes.length > 0 &&

      !activeUniverse

    ) {

      setActiveUniverse(

        semantic.universes[0].universe_slug,

      )

    }

  }, [

    semantic,

    activeUniverse,

  ])

  /* ==========================================================================
  🔥 Active Attributes
  ========================================================================== */

  const activeAttributes =

    useMemo(() => {

      if (

        !semantic.discover?.shelves

      ) {

        return []

      }

      return semantic.discover.shelves.filter(

        (item) =>

          item.parent_group ===

          activeUniverse,

      )

    }, [

      semantic,

      activeUniverse,

    ])

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (

    semantic.universes.length === 0

  ) {

    return (

      <main className={styles.discover}>

        <EmptyState />

      </main>

    )

  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <main
      className={styles.discover}
    >

      <DiscoverHero />

      <UniverseTabs

        universes={

          semantic.universes

        }

        activeUniverse={

          activeUniverse

        }

        onChange={

          setActiveUniverse

        }

      />

      <UniverseGrid

        items={

          activeAttributes

        }

      />

    </main>

  )

}