// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/page.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {

  useEffect,
  useState,

} from 'react'

/* ============================================================================
🔥 Runtime
============================================================================ */

import {

  fetchDiscoverDetail,

} from '@/shared/lib/api/django/pc/discover-detail'

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

/* ============================================================================
🔥 Components
============================================================================ */

import SemanticHero
  from './components/SemanticHero'

import SemanticAliases
  from './components/SemanticAliases'

import ProductGrid
  from './components/ProductGrid'

import EmptyProducts
  from './components/EmptyProducts'

import NotFoundState
  from './components/NotFoundState'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './styles/discover-detail.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  params: {

    'semantic-slug': string

  }

}

/* ============================================================================
🔥 Discover Detail Page
============================================================================ */

export default function DiscoverDetailPage({

  params,

}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const [

    runtime,

    setRuntime,

  ] = useState<

    DiscoverDetailRuntime | null

  >(null)

  const [

    loading,

    setLoading,

  ] = useState(true)

  /* ==========================================================================
  🔥 Load Runtime
  ========================================================================== */

  useEffect(() => {

    async function loadRuntime() {

      try {

        const data =

          await fetchDiscoverDetail(

            params['semantic-slug']

          )

        console.log(

          'DISCOVER DETAIL RUNTIME',

          data

        )

        setRuntime(data)

      }

      catch (error) {

        console.error(

          'DISCOVER DETAIL ERROR',

          error

        )

      }

      finally {

        setLoading(false)

      }

    }

    loadRuntime()

  }, [

    params,

  ])

  /* ==========================================================================
  🔥 Loading
  ========================================================================== */

  if (loading) {

    return (

      <main
        className={
          styles.discoverDetail
        }
      >

        Loading...

      </main>

    )

  }

  /* ==========================================================================
  🔥 Not Found
  ========================================================================== */

  if (

    !runtime ||

    !runtime.found

  ) {

    return (

      <main
        className={
          styles.discoverDetail
        }
      >

        <NotFoundState />

      </main>

    )

  }

  /* ==========================================================================
  🔥 Empty Products
  ========================================================================== */

  const hasProducts =

    runtime.sample_products.length > 0

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <main
      className={
        styles.discoverDetail
      }
    >

      {/* ==========================================================
      Hero
      ========================================================== */}

      <SemanticHero

        runtime={
          runtime
        }

      />

      {/* ==========================================================
      Aliases
      ========================================================== */}

      {

        runtime.aliases.length > 0 && (

          <SemanticAliases

            aliases={
              runtime.aliases
            }

          />

        )

      }

      {/* ==========================================================
      Products
      ========================================================== */}

      {

        hasProducts

          ? (

            <ProductGrid

              products={
                runtime.sample_products
              }

            />

          )

          : (

            <EmptyProducts />

          )

      }

    </main>

  )

}