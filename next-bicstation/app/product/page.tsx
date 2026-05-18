// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/page.tsx
// ============================================================================

'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import Link from 'next/link'

import styles from './styles/product-runtime.module.css'

import {
  buildEndpoint,
} from '@/shared/lib/api/django/pc/utils/buildEndpoint'

/* ============================================================================
🔥 Types
============================================================================ */

type Product = {

  unique_id?: string

  name?: string

  image_url?: string

  recommendation_reason?: string

  grouped_attributes?: Record<
    string,
    any[]
  >
}

type Shelf = {

  attribute: string

  title: string

  description: string
}

type ShelfRuntime = Shelf & {

  products: Product[]
}

/* ============================================================================
🔥 Semantic Shelves
============================================================================ */

const SHELVES: Shelf[] = [

  {
    attribute:
      'usage-business',

    title:
      'Business Workflow',

    description:
      'business workflow 向け semantic runtime。',
  },

  {
    attribute:
      'usage-creator',

    title:
      'Creator Workflow',

    description:
      '映像編集・配信・制作 workflow 向け runtime。',
  },

  {
    attribute:
      'usage-ai',

    title:
      'AI Workflow',

    description:
      '生成AI・ローカルLLM workflow 向け runtime。',
  },

  {
    attribute:
      'usage-gaming',

    title:
      'Gaming Runtime',

    description:
      'gaming immersion と high fps workflow runtime。',
  },

  {
    attribute:
      'usage-mobile',

    title:
      'Compact Mobility',

    description:
      '軽量・持ち運び重視 semantic runtime。',
  },

  {
    attribute:
      'memory-heavy',

    title:
      'Memory Heavy Workflow',

    description:
      '大容量 memory workload 向け runtime。',
  },

]

/* ============================================================================
🔥 Runtime Fetch
============================================================================ */

async function fetchShelfProducts(
  attribute: string
) {

  try {

    /* ======================================================================
    🔥 Endpoint
    ====================================================================== */

    const endpoint =
      buildEndpoint(
        `/general/pc-products/?attribute=${attribute}`
      )

    /* ======================================================================
    🔥 Fetch
    ====================================================================== */

    const response =
      await fetch(
        endpoint
      )

    /* ======================================================================
    🔥 Error
    ====================================================================== */

    if (!response.ok) {

      throw new Error(
        `Failed to fetch ${attribute}`
      )
    }

    /* ======================================================================
    🔥 JSON
    ====================================================================== */

    const data =
      await response.json()

    /* ======================================================================
    🔥 Products
    ====================================================================== */

    return Array.isArray(
      data?.products
    )

      ? data.products

      : []

  } catch (error) {

    console.error(
      'Semantic Shelf Runtime Error:',
      attribute,
      error
    )

    return []
  }
}

/* ============================================================================
🔥 Product Runtime
============================================================================ */

export default function ProductPage() {

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
  🔥 Fetch
  ========================================================================== */

  useEffect(() => {

    async function loadRuntime() {

      try {

        const runtime =
          await Promise.all(

            SHELVES.map(
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

        setShelfRuntime(
          runtime
        )

      } catch (error) {

        console.error(
          'Runtime Load Error:',
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

        <div className={styles.loading}>

          semantic runtime loading...

        </div>

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

      <section className={styles.hero}>

        <div className={styles.heroInner}>

          <div className={styles.heroEyebrow}>

            SEMANTIC PRODUCT RUNTIME

          </div>

          <h1 className={styles.heroTitle}>

            workflow から
            runtime を探す

          </h1>

          <p className={styles.heroDescription}>

            SHIN CORE LINX は、
            semantic discovery runtime として、
            workflow exploration を提供します。

          </p>

        </div>

      </section>

      {/* ================================================================
      Semantic Shelves
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

/* ============================================================================
🔥 Semantic Shelf
============================================================================ */

function SemanticShelf({
  shelf,
}: {
  shelf: ShelfRuntime
}) {

  /* ==========================================================================
  🔥 Ref
  ========================================================================== */

  const shelfRef =
    useRef<HTMLDivElement | null>(
      null
    )

  /* ==========================================================================
  🔥 Scroll
  ========================================================================== */

  function scrollShelf(
    direction:
      'left'
      | 'right'
  ) {

    if (!shelfRef.current) {

      return
    }

    shelfRef.current.scrollBy({

      left:
        direction === 'left'
          ? -1200
          : 1200,

      behavior:
        'smooth',
    })
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className={styles.shelf}>

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.shelfHeader}>

        <div>

          <div className={styles.shelfEyebrow}>

            SEMANTIC WORKFLOW

          </div>

          <h2 className={styles.shelfTitle}>

            {shelf.title}

          </h2>

          <p className={styles.shelfDescription}>

            {shelf.description}

          </p>

        </div>

        {/* ============================================================
        Controls
        ============================================================ */}

        <div className={styles.shelfControls}>

          <button
            className={styles.shelfButton}
            onClick={() =>
              scrollShelf(
                'left'
              )
            }
          >

            ←

          </button>

          <button
            className={styles.shelfButton}
            onClick={() =>
              scrollShelf(
                'right'
              )
            }
          >

            →

          </button>

        </div>

      </div>

      {/* ================================================================
      Horizontal Shelf
      ================================================================ */}

      <div
        ref={shelfRef}
        className={styles.horizontalShelf}
      >

        {shelf.products.map(
          (
            product,
            index
          ) => {

            const groupedAttributes =
              product?.grouped_attributes
              || {}

            const semanticLabels = [

              ...(
                groupedAttributes?.usage
                || []
              ),

              ...(
                groupedAttributes?.semantic
                || []
              ),

            ]
              .slice(0, 4)

            return (

              <Link
                key={
                  product?.unique_id
                  || index
                }
                href={
                  `/product/${product?.unique_id}`
                }
                className={styles.card}
              >

                {/* ================================================
                Image
                ================================================ */}

                <div className={styles.cardImageArea}>

                  {product?.image_url ? (

                    <img
                      src={
                        product.image_url
                      }
                      alt={
                        product?.name
                      }
                      className={
                        styles.cardImage
                      }
                    />

                  ) : (

                    <div
                      className={
                        styles.cardPlaceholder
                      }
                    >

                      NO IMAGE

                    </div>

                  )}

                </div>

                {/* ================================================
                Content
                ================================================ */}

                <div className={styles.cardContent}>

                  <h3 className={styles.cardTitle}>

                    {product?.name}

                  </h3>

                  {product?.recommendation_reason && (

                    <p
                      className={
                        styles.cardReason
                      }
                    >

                      {
                        product.recommendation_reason
                      }

                    </p>

                  )}

                  {!!semanticLabels.length && (

                    <div
                      className={
                        styles.cardChips
                      }
                    >

                      {semanticLabels.map(
                        (
                          label,
                          chipIndex
                        ) => (

                          <div
                            key={chipIndex}
                            className={
                              styles.cardChip
                            }
                          >

                            {
                              typeof label === 'string'

                                ? label

                                : (
                                  label?.label
                                  || label?.name
                                  || 'semantic'
                                )
                            }

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </Link>

            )

          }
        )}

      </div>

    </section>

  )
}