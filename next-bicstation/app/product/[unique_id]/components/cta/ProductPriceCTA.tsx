// ============================================================================
// FILE:
// app/product/[unique_id]/components/cta/ProductPriceCTA.tsx
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

function buildPrice(
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

function buildCTAUrl(
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

export default function ProductPriceCTA({

  product,

  semanticRuntime,

}: Props) {

  const price =

    buildPrice(
      product
    )

  const href =

    buildCTAUrl(
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
        styles.priceCTASection
      }
    >

      <div
        className={
          styles.priceCTACard
        }
      >

        {/* ======================================================
        LABEL
        ====================================================== */}

        <div
          className={
            styles.priceCTALabel
          }
        >
          FINAL DECISION
        </div>

        {/* ======================================================
        TITLE
        ====================================================== */}

        <h2
          className={
            styles.priceCTATitle
          }
        >
          この製品を詳しく確認する
        </h2>

        {/* ======================================================
        SUMMARY
        ====================================================== */}

        {

          summary && (

            <p
              className={
                styles.priceCTADescription
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
                styles.priceCTAChips
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
                        styles.priceCTAChip
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
                styles.priceCTAPrice
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
            styles.priceCTAActions
          }
        >

          <Link
            href={href}

            target="_blank"

            rel="noopener noreferrer"

            className={
              styles.priceCTAPrimary
            }
          >
            最新価格・在庫を確認する
          </Link>

          <Link
            href="/ranking"
            className={
              styles.priceCTASecondary
            }
          >
            他のおすすめ製品を見る
          </Link>

        </div>

        {/* ======================================================
        FOOTER
        ====================================================== */}

        <div
          className={
            styles.priceCTAFooter
          }
        >

          <div
            className={
              styles.priceCTAFooterText
            }
          >
            用途・性能・価格バランスを確認した上で、
            公式販売ページへ移動します。
          </div>

        </div>

      </div>

    </section>

  )

}