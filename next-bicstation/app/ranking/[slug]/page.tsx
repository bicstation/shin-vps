// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Shared Cards
========================================= */

import HeroRankingCard
  from '@/shared/components/organisms/cards/HeroRankingCard'

import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './page.module.css'

/* =========================================
🔥 Dynamic
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Page
========================================= */

export default async function
RankingDetailPage({
  params,
}: {
  params: Promise<{
    slug: string
  }>
}) {

  // ======================================
  // Params
  // ======================================

  const {
    slug,
  } = await params

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    `${process.env.INTERNAL_API_URL}/general/pc-products/ranking/${slug}/`

  // ======================================
  // Fetch
  // ======================================

  let rankingJson = null

  let status = 500

  try {

    const response =

      await fetch(
        endpoint,
        {
          cache:
            'no-store',
        }
      )

    status =
      response.status

    rankingJson =
      await response.json()

  } catch (error) {

    console.error(error)

  }

  // ======================================
  // Products
  // ======================================

  const rankingProducts =

    Array.isArray(
      rankingJson?.products
    )

      ? rankingJson.products

      : []

  // ======================================
  // Split
  // ======================================

  const heroProduct =

    rankingProducts[0]

  const subProducts =

    rankingProducts.slice(1)

  // ======================================
  // Render
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      {/* ================================= */}
      {/* Debug Header */}
      {/* ================================= */}

      <section
        className={
          styles.debugHero
        }
      >

        <h1
          className={
            styles.debugTitle
          }
        >

          Semantic Ranking Debug

        </h1>

        {/* ============================= */}
        {/* Debug Grid */}
        {/* ============================= */}

        <div
          className={
            styles.debugGrid
          }
        >

          <div
            className={
              styles.debugCard
            }
          >

            <div
              className={
                styles.debugLabel
              }
            >

              SLUG

            </div>

            <div
              className={
                styles.debugValue
              }
            >

              {slug}

            </div>

          </div>

          <div
            className={
              styles.debugCard
            }
          >

            <div
              className={
                styles.debugLabel
              }
            >

              STATUS

            </div>

            <div
              className={
                styles.debugValue
              }
            >

              {status}

            </div>

          </div>

          <div
            className={
              styles.debugCard
            }
          >

            <div
              className={
                styles.debugLabel
              }
            >

              RESULT COUNT

            </div>

            <div
              className={
                styles.debugValue
              }
            >

              {rankingProducts.length}

            </div>

          </div>

        </div>

        {/* ============================= */}
        {/* URL */}
        {/* ============================= */}

        <div
          className={
            styles.requestBlock
          }
        >

          <div
            className={
              styles.requestLabel
            }
          >

            Request URL

          </div>

          <div
            className={
              styles.requestUrl
            }
          >

            {endpoint}

          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* Hero Product */}
      {/* ================================= */}

      {heroProduct && (

        <section
          className={
            styles.heroSection
          }
        >

          <HeroRankingCard
            product={
              heroProduct
            }
          />

        </section>

      )}

      {/* ================================= */}
      {/* Product Grid */}
      {/* ================================= */}

      {!!subProducts.length && (

        <section
          className={
            styles.productSection
          }
        >

          <div
            className={
              styles.productGrid
            }
          >

            {subProducts.map(
              (
                product,
                index
              ) => (

                <ProductCard

                  key={
                    product?.unique_id
                    || index
                  }

                  product={
                    product
                  }

                />

              )
            )}

          </div>

        </section>

      )}

    </main>
  )
}