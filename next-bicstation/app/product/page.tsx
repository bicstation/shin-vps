// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/page.tsx
// ============================================================================

import Link from 'next/link'

import styles from './styles/product-runtime.module.css'

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

/* ============================================================================
🔥 Runtime Fetch
============================================================================ */

async function getProducts(): Promise<Product[]> {

  try {

    const response =
      await fetch(

        'http://bicstation-host:8083/api/general/pc-products/',

        {
          cache:
            'no-store',
        }
      )

    if (!response.ok) {

      throw new Error(
        'Failed to fetch products'
      )
    }

    const data =
      await response.json()

    /*
    ========================================================================
    🔥 Runtime Shape
    ========================================================================
    */

    if (
      Array.isArray(
        data?.products
      )
    ) {

      return data.products
    }

    /*
    ========================================================================
    🔥 Fallback
    ========================================================================
    */

    return []

  } catch (error) {

    console.error(
      'Product Runtime Error:',
      error
    )

    return []
  }
}

/* ============================================================================
🔥 Product Runtime Listing
============================================================================ */

export default async function ProductPage() {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const products =
    await getProducts()

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
            スペック比較ではなく、
            semantic workflow discovery を提供します。

          </p>

        </div>

      </section>

      {/* ================================================================
      Runtime Shelf
      ================================================================ */}

      <div className={styles.runtimeShelves}>

        <section className={styles.shelf}>

          {/* ============================================================
          Shelf Header
          ============================================================ */}

          <div className={styles.shelfHeader}>

            <div>

              <div className={styles.shelfEyebrow}>

                SEMANTIC RUNTIME

              </div>

              <h2 className={styles.shelfTitle}>

                Discovery Runtime

              </h2>

              <p className={styles.shelfDescription}>

                backend semantic runtime が
                検出した discovery nodes。

              </p>

            </div>

          </div>

          {/* ============================================================
          Shelf Grid
          ============================================================ */}

          <div className={styles.shelfGrid}>

            {products.map(
              (
                product,
                index
              ) => {

                /*
                ==========================================================
                🔥 Runtime
                ==========================================================
                */

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
                  .slice(0, 3)

                /*
                ==========================================================
                🔥 Render
                ==========================================================
                */

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

                      {/* ============================================
                      Semantic Chips
                      ============================================ */}

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

      </div>

    </main>

  )
}