// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/discover/page.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Discover Runtime Page
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic discovery runtime hub
 *   - workflow-oriented exploration entry
 *   - semantic navigation spine
 *
 * IMPORTANT:
 *   - backend owns semantic authority
 *   - frontend orchestrates discovery UX only
 *
 * ============================================================================
 */

/* ============================================================================
🔥 React
============================================================================ */

import {
  useEffect,
  useState,
} from 'react'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles from './styles/product-runtime.module.css'

/* ============================================================================
🔥 Runtime
============================================================================ */

import runtimeLayout from './orchestration/runtimeLayout'

import {
  fetchShelfProducts,
} from './runtime/fetchShelfProducts'

/* ============================================================================
🔥 Components
============================================================================ */

import RuntimeHero from './components/hero/RuntimeHero'

import SemanticShelf from './components/shelves/SemanticShelf'

import LoadingState from './components/common/LoadingState'

import RuntimeDebugInspector from './components/debug/RuntimeDebugInspector'

/* ============================================================================
🔥 Types
============================================================================ */

import type {
  ShelfRuntime,
} from './types/runtime'

/* ============================================================================
🔥 Discover Runtime Page
============================================================================ */

export default function DiscoverPage() {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const [
    shelfRuntime,
    setShelfRuntime,
  ] = useState<ShelfRuntime[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  /* ==========================================================================
  🔥 Debug
  ========================================================================== */

  const debug =
    typeof window !==
    'undefined'

      &&

    (
      new URLSearchParams(
        window.location.search
      ).has('debug')
    )

  /* ==========================================================================
  🔥 Runtime Fetch
  ========================================================================== */

  useEffect(() => {

    async function loadRuntime() {

      try {

        /* ================================================================
        Semantic Runtime
        ================================================================ */

        const runtime =
          await Promise.all(

            runtimeLayout.shelves.map(
              async (
                shelf
              ) => ({

                ...shelf,

                products:
                  await fetchShelfProducts(
                    shelf.attribute
                  ),
              })
            )
          )

        /* ================================================================
        State
        ================================================================ */

        setShelfRuntime(
          runtime
        )

      } catch (error) {

        console.error(
          '🔥 Discover Runtime Error:',
          error
        )

      } finally {

        setLoading(false)
      }
    }

    loadRuntime()

  }, [])

  /* ==========================================================================
  🔥 Loading
  ========================================================================== */

  if (loading) {

    return (

      <main className={styles.runtime}>

        <LoadingState />

      </main>

    )
  }

  /* ==========================================================================
  🔥 Debug
  ========================================================================== */

  if (debug) {

    return (

      <main className={styles.runtime}>

        <RuntimeDebugInspector
          data={shelfRuntime}
        />

      </main>

    )
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <main className={styles.runtime}>

      {/* ================================================================
      Hero
      ================================================================ */}

      <RuntimeHero />

      {/* ================================================================
      Semantic Discovery Shelves
      ================================================================ */}

      <div className={styles.runtimeShelves}>

        {shelfRuntime.map(
          (
            shelf
          ) => (

            <SemanticShelf
              key={shelf.attribute}
              shelf={shelf}
            />

          )
        )}

      </div>

    </main>

  )
}