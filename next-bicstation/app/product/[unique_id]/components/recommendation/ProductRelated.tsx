// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/ProductRelated.tsx
//
// SHIN CORE LINX
// Related Configuration Experience
//
// Responsibility
//
// Related Product Runtime
//        ↓
// ProductRelated
//        ↓
// Related Configuration Observation
//
// ProductRelated = Related Product Configuration Experience
//
// ✓ Displays related-product identity
// ✓ Displays observable product configuration
// ✓ Provides product navigation
// ✓ Handles empty / partial configuration safely
//
// ✗ Semantic generation
// ✗ Similarity calculation
// ✗ Workflow inference
// ✗ Recommendation generation
// ✗ Runtime generation
//
// Authority
//
// Related Product Runtime
//        ↓
// Adapter / Projection
//        ↓
// ProductRelated
//
// ============================================================================

'use client'

import Link
  from 'next/link'


/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './recommendation.module.css'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    any

  related:
    any[]

}


/* ============================================================================
🔥 Types
============================================================================ */

type ConfigurationItem = {

  label:
    string

  value:
    string

}


/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * ============================================================================
 * Product Name
 * ============================================================================
 *
 * Related Runtimeから提供された製品名を表示する。
 *
 * ここでは製品名を生成しない。
 *
 * ============================================================================
 */

function getProductName(
  item: any,
): string {

  return (

    item?.name

    ||

    item?.product_name

    ||

    '関連PC'

  )

}


/**
 * ============================================================================
 * Product URL
 * ============================================================================
 *
 * unique_id が存在する場合のみProduct Detailへ遷移する。
 *
 * ============================================================================
 */

function getProductHref(
  item: any,
): string | null {

  const uniqueId =

    item?.unique_id

    ||

    item?.uniqueId


  if (
    !uniqueId
  ) {

    return null

  }


  return (

    `/product/${encodeURIComponent(
      String(uniqueId)
    )}`

  )

}


/**
 * ============================================================================
 * Configuration
 * ============================================================================
 *
 * Related Product Runtimeから取得された
 * 実際の製品構成だけを表示用データへ変換する。
 *
 * ここでは以下を行わない。
 *
 * ✗ Similarity inference
 * ✗ Workflow inference
 * ✗ Recommendation generation
 * ✗ Semantic interpretation
 *
 * ============================================================================
 */

function buildConfiguration(
  item: any,
): ConfigurationItem[] {

  const configuration:
    ConfigurationItem[] = []


  /* ==========================================================================
  CPU
  ========================================================================== */

  const cpu =

    item?.cpu_model

    ||

    item?.cpuModel


  if (cpu) {

    configuration.push({

      label:
        'CPU',

      value:
        String(cpu),

    })

  }


  /* ==========================================================================
  GPU
  ========================================================================== */

  const gpu =

    item?.gpu_model

    ||

    item?.gpuModel


  if (gpu) {

    configuration.push({

      label:
        'GPU',

      value:
        String(gpu),

    })

  }


  /* ==========================================================================
  MEMORY
  ========================================================================== */

  const memory =

    item?.memory_gb

    ??

    item?.memoryGb


  if (

    memory !== undefined

    &&

    memory !== null

  ) {

    configuration.push({

      label:
        'MEMORY',

      value:
        `${memory}GB`,

    })

  }


  /* ==========================================================================
  STORAGE
  ========================================================================== */

  const storage =

    item?.storage_gb

    ??

    item?.storageGb


  if (

    storage !== undefined

    &&

    storage !== null

  ) {

    configuration.push({

      label:
        'STORAGE',

      value:
        `${storage}GB`,

    })

  }


  return configuration

}


/**
 * ============================================================================
 * Related Products
 * ============================================================================
 *
 * Related Runtimeから取得された配列を
 * UI表示可能な製品だけに整理する。
 *
 * ============================================================================
 */

function normalizeRelatedProducts(
  related: any[],
): any[] {

  if (
    !Array.isArray(
      related
    )
  ) {

    return []

  }


  return (

    related

      .filter(
        (
          item
        ) => (

          item
          &&
          typeof item === 'object'

        )
      )

      .slice(
        0,
        4
      )

  )

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductRelated({

  product,

  related,

}: Props) {


  /* ==========================================================================
  Current Product
  ========================================================================== */

  /*
   * 現在のProductRelatedでは
   * current productそのものを表示対象として使用しない。
   *
   * Props契約はProductRelatedSectionとの互換性のため維持する。
   */

  void product


  /* ==========================================================================
  Related Products
  ========================================================================== */

  const relatedProducts =

    normalizeRelatedProducts(
      related
    )


  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (
    relatedProducts.length === 0
  ) {

    return null

  }


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section

      className={
        styles.relatedSection
      }

      aria-labelledby="related-configuration-title"

    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div

        className={
          styles.relatedHeader
        }

      >

        {/* ====================================================================
        LABEL
        ==================================================================== */}

        <div

          className={
            styles.relatedLabel
          }

        >

          RELATED CONFIGURATION

        </div>


        {/* ====================================================================
        TITLE
        ==================================================================== */}

        <h2

          id="related-configuration-title"

          className={
            styles.relatedTitle
          }

        >

          このPCと近い構成のPC

        </h2>


        {/* ====================================================================
        DESCRIPTION
        ==================================================================== */}

        <p

          className={
            styles.relatedDescription
          }

        >

          関連PCとして取得された製品について、
          CPU・GPU・メモリー・ストレージなどの
          実際の構成を確認できます。

        </p>

      </div>


      {/* ======================================================================
      RELATED PRODUCT GRID
      ====================================================================== */}

      <div

        className={
          styles.relatedNarratives
        }

      >

        {

          relatedProducts.map(

            (
              item,
              index,
            ) => {

              /* ================================================================
              PRODUCT
              ================================================================ */

              const name =
                getProductName(
                  item
                )


              const href =
                getProductHref(
                  item
                )


              /* ================================================================
              CONFIGURATION
              ================================================================ */

              const configuration =
                buildConfiguration(
                  item
                )


              /*
               * 構成情報が存在しない製品は、
               * このExperienceでは表示しない。
               */

              if (
                configuration.length === 0
              ) {

                return null

              }


              /* ================================================================
              KEY
              ================================================================ */

              const uniqueId =

                item?.unique_id

                ||

                item?.uniqueId


              const key =

                uniqueId

                  ? String(
                      uniqueId
                    )

                  : `${name}-${index}`


              /* ================================================================
              CARD
              ================================================================ */

              return (

                <article

                  key={
                    key
                  }

                  className={
                    styles.relatedNarrativeCard
                  }

                >

                  {/* ============================================================
                  RELATED PRODUCT
                  ============================================================ */}

                  <div

                    className={
                      styles.relatedProductIdentity
                    }

                  >

                    <div

                      className={
                        styles.relatedProductLabel
                      }

                    >

                      RELATED PC

                    </div>


                    {

                      href

                        ? (

                          <Link

                            href={
                              href
                            }

                            className={
                              styles.relatedProductLink
                            }

                          >

                            {
                              name
                            }

                          </Link>

                        )

                        : (

                          <div

                            className={
                              styles.relatedProductName
                            }

                          >

                            {
                              name
                            }

                          </div>

                        )

                    }

                  </div>


                  {/* ============================================================
                  CONFIGURATION
                  ============================================================ */}

                  <div

                    className={
                      styles.relatedConfiguration
                    }

                  >

                    {

                      configuration.map(

                        (
                          spec
                        ) => (

                          <div

                            key={
                              spec.label
                            }

                            className={
                              styles.relatedConfigurationItem
                            }

                          >

                            {/* ==================================================
                            LABEL
                            ================================================== */}

                            <div

                              className={
                                styles.relatedConfigurationLabel
                              }

                            >

                              {
                                spec.label
                              }

                            </div>


                            {/* ==================================================
                            VALUE
                            ================================================== */}

                            <div

                              className={
                                styles.relatedConfigurationValue
                              }

                            >

                              {
                                spec.value
                              }

                            </div>

                          </div>

                        )

                      )

                    }

                  </div>


                </article>

              )

            }

          )

        }

      </div>


      {/* ======================================================================
      FOOTER
      ====================================================================== */}

      <div

        className={
          styles.relatedFooter
        }

      >

        関連PCとして取得された構成情報を
        表示しています。

      </div>

    </section>

  )

}