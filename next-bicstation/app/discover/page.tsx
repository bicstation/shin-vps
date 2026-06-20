// ============================================================================
// FILE:
// /app/discover/page.tsx
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

import {
  fetchSemanticRuntime,
} from '@/shared/lib/api/django/pc/semantics'

import type {
  SemanticRuntime,
} from '@/shared/lib/api/django/pc/semantics'

/* ============================================================================
🔥 Components
============================================================================ */

import DiscoverHero
  from './components/hero/DiscoverHero'

import UniverseTabs
  from './components/tabs/UniverseTabs'

import UniverseGrid
  from './components/cards/UniverseGrid'

import EmptyState
  from './components/common/EmptyState'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './styles/discover.module.css'

/* ============================================================================
🔥 Discover Universe Page
============================================================================ */

export default function DiscoverPage() {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const [
    runtime,
    setRuntime,
  ] = useState<SemanticRuntime | null>(
    null
  )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    activeUniverse,
    setActiveUniverse,
  ] = useState('')

  /* ==========================================================================
  🔥 Load Runtime
  ========================================================================== */

  useEffect(() => {

    async function loadRuntime() {

      try {

        const data =
          await fetchSemanticRuntime()

        setRuntime(data)

        if (
          data?.universes?.length
        ) {

          setActiveUniverse(
            data.universes[0]
              .universe_slug
          )

        }

      } catch (error) {

        console.error(
          'DISCOVER UNIVERSE ERROR',
          error
        )

      } finally {

        setLoading(false)

      }

    }

    loadRuntime()

  }, [])

  /* ==========================================================================
  🔥 Active Navigation
  ========================================================================== */

  const activeNavigation =
    useMemo(() => {

      if (!runtime) {

        return []

      }

      return runtime.navigation.filter(

        (item) =>

          item.parent_group ===
          activeUniverse

      )

    }, [

      runtime,
      activeUniverse,

    ])

  /* ==========================================================================
  🔥 Loading
  ========================================================================== */

  if (loading) {

    return (

      <main
        className={
          styles.discover
        }
      >

        Loading...

      </main>

    )

  }

  /* ==========================================================================
  🔥 Empty Runtime
  ========================================================================== */

  if (

    !runtime ||

    runtime.universes.length === 0

  ) {

    return (

      <main
        className={
          styles.discover
        }
      >

        <EmptyState />

      </main>

    )

  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <main
      className={
        styles.discover
      }
    >

      {/* ==========================================================
      Hero
      ========================================================== */}

      <DiscoverHero />

      {/* ==========================================================
      Universe Tabs
      ========================================================== */}

      <UniverseTabs

        universes={
          runtime.universes
        }

        activeUniverse={
          activeUniverse
        }

        onChange={
          setActiveUniverse
        }

      />

      {/* ==========================================================
      Universe Cards
      ========================================================== */}

      <UniverseGrid

        items={
          activeNavigation
        }

      />

    </main>

  )

}