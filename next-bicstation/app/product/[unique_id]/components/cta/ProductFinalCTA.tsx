// ============================================================================
// FILE:
// app/product/[unique_id]/components/cta/ProductFinalCTA.tsx
//
// SHIN CORE LINX
// Product Final Decision Experience
//
// RESPONSIBILITY
//
// Product
//      +
// Product Semantic Runtime
//      ↓
// ProductFinalCTA
//      ↓
// Final Decision Experience
//
// ProductFinalCTA = 最終意思決定 / 購入導線
//
// ✓ Product Identity
// ✓ Semantic Summary
// ✓ Workflow Tags
// ✓ Price
// ✓ Affiliate / Product URL
// ✓ Final Navigation
//
// ✗ Semantic generation
// ✗ AI inference
// ✗ Workflow inference
// ✗ Recommendation generation
// ✗ Runtime generation
// ✗ Product classification
//
// Meaning is already provided by:
//      Backend
//          ↓
//      Adapter
//          ↓
//      Projection
//
// ============================================================================

import Link
  from 'next/link'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './cta.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

  semanticRuntime?:
    ProjectedSemanticRuntime

}


/* ============================================================================
🔥 Workflow Label
============================================================================ */

/**
 * Backend / Adapterから提供された
 * workflow tagをUI表示用ラベルへ変換する。
 *
 * ここでは新しい意味を生成しない。
 */

function getWorkflowLabel(
  tag: string
): string {

  const labels:
    Record<string, string> = {

    'usage-ai':
      'AI開発・生成AI',

    'usage-gaming':
      'Gaming',

    'usage-creator':
      '動画編集・制作',

    'usage-business':
      'ビジネス',

    'usage-mobile':
      'モバイル',

  }

  return (
    labels[tag]
    ||
    tag
  )

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductFinalCTA({

  product,

  semanticRuntime,

}: Props) {


  /* ==========================================================================

  Guard

  ========================================================================== */

  if (
    !product
  ) {

    return null

  }


  /* ==========================================================================

  Product Identity

  ========================================================================== */

  const productName =

    product.name
    ?.trim()
    ||
    'このPC'


  /* ==========================================================================

  Semantic Summary

  ========================================================================== */

  const semanticSummary =

    semanticRuntime
      ?.semanticSummary
      ?.trim()
    ||
    ''


  /* ==========================================================================

  Workflow Tags

  ========================================================================== */

  const workflowTags =

    Array.isArray(
      semanticRuntime
        ?.workflowTags
    )

      ? Array.from(
          new Set(
            semanticRuntime.workflowTags
              .filter(
                (
                  tag
                ) =>
                  typeof tag === 'string'
                  &&
                  tag.trim()
              )
              .map(
                (
                  tag
                ) =>
                  tag.trim()
              )
          )
        )

      : []


  /* ==========================================================================

  Commerce

  ========================================================================== */

  const price =

    product.price


  const affiliateUrl =

    product.affiliateUrl
    ||
    ''


  const productUrl =

    product.url
    ||
    ''


  const finalUrl =

    affiliateUrl
    ||
    productUrl


  /* ==========================================================================

  Price Text

  ========================================================================== */

  const priceText =

    price != null
    &&
    Number(price) > 0

      ? `¥${Number(
          price
        ).toLocaleString()}`

      : ''


  /* ==========================================================================

  Meaning Availability

  ========================================================================== */

  const hasMeaning =

    Boolean(
      semanticSummary
    )
    ||
    workflowTags.length > 0


  /* ==========================================================================

  Render

  ========================================================================== */

  return (

    <section
      className={
        styles.finalCTASection
      }

      aria-labelledby="product-final-cta-title"
    >

      <div
        className={
          styles.finalCTACard
        }
      >


        {/* ====================================================================
        LABEL
        ==================================================================== */}

        <div
          className={
            styles.finalCTALabel
          }
        >

          FINAL DECISION

        </div>


        {/* ====================================================================
        TITLE
        ==================================================================== */}

        <h2
          id="product-final-cta-title"

          className={
            styles.finalCTATitle
          }
        >

          {productName}
          を最終候補として確認する

        </h2>


        {/* ====================================================================
        DESCRIPTION
        ==================================================================== */}

        <p
          className={
            styles.finalCTADescription
          }
        >

          このPCの特徴を確認したうえで、
          最新の価格・在庫・販売条件を確認できます。

        </p>


        {/* ====================================================================
        SEMANTIC SUMMARY
        ==================================================================== */}

        {

          semanticSummary
          && (

            <div
              className={
                styles.finalCTASummary
              }
            >

              <div
                className={
                  styles.finalCTASummaryLabel
                }
              >

                PRODUCT INSIGHT

              </div>

              <p
                className={
                  styles.finalCTASummaryText
                }
              >

                {semanticSummary}

              </p>

            </div>

          )

        }


        {/* ====================================================================
        WORKFLOW
        ==================================================================== */}

        {

          workflowTags.length > 0
          && (

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
                      key={
                        `${tag}-${index}`
                      }

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


        {/* ====================================================================
        PRICE
        ==================================================================== */}

        {

          priceText
          && (

            <div
              className={
                styles.finalCTAPriceArea
              }
            >

              <div
                className={
                  styles.finalCTAPriceLabel
                }
              >

                CURRENT PRICE

              </div>

              <div
                className={
                  styles.finalCTAPrice
                }
              >

                {priceText}

              </div>

            </div>

          )

        }


        {/* ====================================================================
        ACTIONS
        ==================================================================== */}

        <div
          className={
            styles.finalCTAActions
          }
        >

          {

            finalUrl
            ? (

              <a
                href={
                  finalUrl
                }

                target="_blank"

                rel="nofollow noopener noreferrer"

                className={
                  styles.finalCTAPrimary
                }
              >

                <span>
                  最新価格・在庫を確認する
                </span>

                <span
                  aria-hidden="true"
                >
                  →
                </span>

              </a>

            )
            : (

              <div
                className={
                  styles.finalCTAUnavailable
                }
              >

                販売ページを確認できません

              </div>

            )

          }


          <Link
            href="/discover"

            className={
              styles.finalCTASecondary
            }
          >

            他のおすすめ製品も比較する

          </Link>

        </div>


        {/* ====================================================================
        STORE INFORMATION
        ==================================================================== */}

        {

          finalUrl
          && (

            <div
              className={
                styles.finalCTAStore
              }
            >

              {

                affiliateUrl

                  ?

                  '販売元の商品ページへ移動します。'

                  :

                  '商品ページを開きます。'

              }

            </div>

          )

        }


        {/* ====================================================================
        TRUST
        ==================================================================== */}

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

            価格・在庫・販売条件は
            販売ページでご確認ください。

          </div>

        </div>


        {/* ====================================================================
        EMPTY MEANING NOTE
        ==================================================================== */}

        {

          !hasMeaning
          && (

            <div
              className={
                styles.finalCTAEmptyMeaning
              }
            >

              製品の詳細情報を確認してから
              販売ページへ進めます。

            </div>

          )

        }

      </div>

    </section>

  )

}