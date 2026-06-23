// ============================================================================
// FILE:
// app/product/[unique_id]/components/intent/ProductRelatedIntents.tsx
// ============================================================================

import Link
  from 'next/link'

import styles
  from './intent.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type RelatedIntent = {

  slug: string

  title: string

  description?: string | null

}

type Props = {

  semanticRuntime?: {

    related_intents?: RelatedIntent[]

  }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductRelatedIntents({

  semanticRuntime,

}: Props) {

  const intents =

    semanticRuntime
      ?.related_intents

    ||

    []

  if (

    intents.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.intentSection
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.label
          }
        >
          RELATED DISCOVERY
        </div>

        <h2
          className={
            styles.title
          }
        >
          次に探索するカテゴリー
        </h2>

        <p
          className={
            styles.description
          }
        >
          この製品に関連する
          Discovery Runtime を表示しています。
        </p>

      </div>

      {/* ==========================================================
      INTENT GRID
      ========================================================== */}

      <div
        className={
          styles.grid
        }
      >

        {

          intents.map(

            (
              intent
            ) => (

              <Link
                key={
                  intent.slug
                }

                href={
                  `/discover/${intent.slug}`
                }

                className={
                  styles.card
                }
              >

                <div
                  className={
                    styles.cardContent
                  }
                >

                  <h3
                    className={
                      styles.cardTitle
                    }
                  >
                    {
                      intent.title
                    }
                  </h3>

                  {

                    intent.description && (

                      <p
                        className={
                          styles.cardDescription
                        }
                      >
                        {
                          intent.description
                        }
                      </p>

                    )

                  }

                </div>

                <div
                  className={
                    styles.cardAction
                  }
                >
                  探索する →
                </div>

              </Link>

            )

          )

        }

      </div>

    </section>

  )

}