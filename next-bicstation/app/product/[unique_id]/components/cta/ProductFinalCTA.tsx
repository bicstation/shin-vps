// ============================================================================
// FILE:
// app/product/[unique_id]/components/cta/ProductFinalCTA.tsx
// ============================================================================

import Link
  from 'next/link'

import styles
  from './cta.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product: any

  semanticRuntime?: {

    semantic_summary?: string

    workflow_tags?: string[]

  }

}

/* ============================================================================
🔥 Helpers
============================================================================ */

function buildPriceText(
  product: any
) {

  if (
    !product?.price
  ) {

    return null

  }

  return `¥${Number(
    product.price
  ).toLocaleString()}`

}

function buildCTA(
  product: any
) {

  return (

    product?.affiliate_url

    ||

    product?.url

    ||

    '#'

  )

}

function getWorkflowLabel(
  tag: string
): string {

  const labels:
    Record<string, string> = {

      'usage-ai':
        'AI開発',

      'usage-creator':
        '動画編集',

      'usage-gaming':
        'FPS Gaming',

      'usage-business':
        'ビジネス',

      'usage-mobile':
        'モバイル',

    }

  return (
    labels[tag]
    || tag
  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductFinalCTA({

  product,

  semanticRuntime,

}: Props) {

  const price =

    buildPriceText(
      product
    )

  const href =

    buildCTA(
      product
    )

  const summary =

    semanticRuntime
      ?.semantic_summary

    ||

    ''

  const workflowTags =

    semanticRuntime
      ?.workflow_tags

    ||

    []

  return (

    <section
      className={
        styles.finalCTASection
      }
    >

      <div
        className={
          styles.finalCTACard
        }
      >

        {/* ======================================================
        LABEL
        ====================================================== */}

        <div
          className={
            styles.finalCTALabel
          }
        >
          FINAL DECISION
        </div>

        {/* ======================================================
        TITLE
        ====================================================== */}

        <h2
          className={
            styles.finalCTATitle
          }
        >
          このPCを最終候補として確認する
        </h2>

        {/* ======================================================
        SUMMARY
        ====================================================== */}

        {

          summary && (

            <p
              className={
                styles.finalCTADescription
              }
            >
              {summary}
            </p>

          )

        }

        {/* ======================================================
        WORKFLOW
        ====================================================== */}

        {

          workflowTags.length > 0 && (

            <div
              className={
                styles.finalCTAChips
              }
            >

              {

                workflowTags.map(

                  (
                    tag,
                    index
                  ) => (

                    <div
                      key={index}
                      className={
                        styles.finalCTAChip
                      }
                    >
                      {
                        getWorkflowLabel(
                          tag
                        )
                      }
                    </div>

                  )

                )

              }

            </div>

          )

        }

        {/* ======================================================
        PRICE
        ====================================================== */}

        {

          price && (

            <div
              className={
                styles.finalCTAPrice
              }
            >
              {price}
            </div>

          )

        }

        {/* ======================================================
        ACTIONS
        ====================================================== */}

        <div
          className={
            styles.finalCTAActions
          }
        >

          <Link
            href={href}

            target="_blank"

            rel="noopener noreferrer"

            className={
              styles.finalCTAPrimary
            }
          >
            最新価格・在庫を確認する
          </Link>

          <Link
            href="/discover"

            className={
              styles.finalCTASecondary
            }
          >
            他のおすすめ製品も比較する
          </Link>

        </div>

        {/* ======================================================
        FOOTER
        ====================================================== */}

        <div
          className={
            styles.finalCTAFooter
          }
        >

          <div
            className={
              styles.finalCTAFooterText
            }
          >
            購入前に価格・在庫・販売条件を
            公式販売ページで確認できます。
          </div>

        </div>

      </div>

    </section>

  )

}