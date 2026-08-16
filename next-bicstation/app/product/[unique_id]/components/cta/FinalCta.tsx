// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/components/cta/FinalCta.tsx
//
// SHIN CORE LINX
// Product Final CTA
//
// RESPONSIBILITY
//
// Product Runtime
//      ↓
// FinalCta
//
// FinalCta = Product Insight + Commerce CTA
//
// ✓ Product Identity
// ✓ Semantic Runtime Observation
// ✓ Compiled Runtime Observation
// ✓ Product Points
// ✓ Semantic Reasons
// ✓ Grouped Attributes
// ✓ Related Intents
// ✓ Human-readable Product Information
// ✓ Product Image
// ✓ Affiliate / Product URL
//
// ✗ Semantic generation
// ✗ AI inference
// ✗ Recommendation generation
// ✗ Runtime generation
//
// Authority
//
// ProjectedProduct
//        ↓
// FinalCta
//
// ============================================================================

'use client'

import styles
  from './FinalCta.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Compatibility Type
============================================================================ */

/**
 * FinalCta receives ProjectedProduct from ProductCTASection.
 *
 * The existing FinalCta runtime also supports legacy / alternate
 * API field names so that the current UI behavior is preserved.
 *
 * IMPORTANT
 *
 * ProjectedProduct remains the primary authority.
 *
 * The additional optional fields below exist only for
 * backward-compatible observation of existing runtime payloads.
 */

type FinalCtaProduct =
  ProjectedProduct
  & {

    maker?: unknown
    brand?: unknown
    series?: unknown
    name?: unknown

    imageUrl?: unknown
    image_url?: unknown

    affiliateUrl?: unknown
    affiliate_url?: unknown

    url?: unknown

    aiSummary?: unknown
    ai_summary?: unknown

    targetUser?: unknown
    target_user?: unknown

    strengths?: unknown
    weaknesses?: unknown

    usageTags?: unknown
    usage_tags?: unknown

    productPoints?: unknown
    product_points?: unknown

    semanticLabels?: unknown
    semantic_labels?: unknown

    workflowTags?: unknown
    workflow_tags?: unknown

    semanticScore?: unknown
    semantic_score?: unknown

    productSemanticRuntime?: unknown
    product_semantic_runtime?: unknown

    compiledRuntime?: unknown
    compiled_runtime?: unknown

    data?: {
      product?: FinalCtaProduct
    }

    product?: FinalCtaProduct

  }


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

  summary?:
    any

  semanticGroups?:
    any

  semanticRuntime?:
    ProjectedSemanticRuntime

}


/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * Return the first non-empty string value.
 *
 * No semantic generation is performed here.
 */

function firstValue(
  ...values: unknown[]
): string {

  for (
    const value of values
  ) {

    if (
      typeof value === 'string'
      &&
      value.trim()
    ) {

      return value.trim()

    }

  }

  return ''

}


/* ============================================================================
🔥 Resolve Product
============================================================================ */

/**
 * Supports both:
 *
 * Direct Product
 *
 * {
 *   ...
 * }
 *
 * and legacy API wrapper:
 *
 * {
 *   data: {
 *     product: {...}
 *   }
 * }
 *
 * and:
 *
 * {
 *   product: {...}
 * }
 *
 * This does not generate meaning.
 * It only resolves the actual product object.
 */

function resolveProduct(
  input:
    FinalCtaProduct
): FinalCtaProduct {

  if (
    input?.data?.product
  ) {

    return (
      input.data.product
    )

  }

  if (
    input?.product
  ) {

    return (
      input.product
    )

  }

  return input

}


/* ============================================================================
🔥 Normalize List
============================================================================ */

/**
 * Supports:
 *
 * ✓ string[]
 * ✓ number[]
 * ✓ JSON string "[...]"
 * ✓ comma separated string
 * ✓ newline separated string
 * ✓ Japanese comma separated string
 *
 * This is only presentation normalization.
 */

function normalizeList(
  value:
    unknown
): string[] {

  if (
    Array.isArray(
      value
    )
  ) {

    return (

      value

        .filter(
          (
            item
          ): item is string | number =>

            typeof item === 'string'
            ||
            typeof item === 'number'

        )

        .map(
          item =>
            String(
              item
            ).trim()
        )

        .filter(Boolean)

    )

  }

  if (
    typeof value !== 'string'
    ||
    !value.trim()
  ) {

    return []

  }

  const text =
    value.trim()

  try {

    const parsed =
      JSON.parse(
        text
      )

    if (
      Array.isArray(
        parsed
      )
    ) {

      return (

        parsed

          .filter(
            (
              item
            ): item is string | number =>

              typeof item === 'string'
              ||
              typeof item === 'number'

          )

          .map(
            item =>
              String(
                item
              ).trim()
          )

          .filter(Boolean)

      )

    }

  } catch {

    // JSONではない通常文字列として扱う

  }

  return (

    text

      .split(
        /\n|、|，|,/
      )

      .map(
        item =>
          item.trim()
      )

      .filter(Boolean)

  )

}


/* ============================================================================
🔥 Semantic Runtime
============================================================================ */

function getSemanticRuntime(
  product:
    FinalCtaProduct
):
  Record<string, any> {

  const runtime =

    product.productSemanticRuntime

    ||

    product.product_semantic_runtime

    ||

    {}

  if (
    runtime
    &&
    typeof runtime === 'object'
    &&
    !Array.isArray(
      runtime
    )
  ) {

    return (
      runtime as Record<
        string,
        any
      >
    )

  }

  return {}

}


/* ============================================================================
🔥 Compiled Runtime
============================================================================ */

function getCompiledRuntime(
  product:
    FinalCtaProduct
):
  Record<string, any> {

  const compiled =

    product.compiledRuntime

    ||

    product.compiled_runtime

    ||

    {}

  if (
    compiled
    &&
    typeof compiled === 'object'
    &&
    !Array.isArray(
      compiled
    )
  ) {

    return (
      compiled as Record<
        string,
        any
      >
    )

  }

  return {}

}


/* ============================================================================
🔥 Semantic Labels
============================================================================ */

function getSemanticLabels(
  product:
    FinalCtaProduct
):
  string[] {

  const runtime =
    getSemanticRuntime(
      product
    )

  const compiled =
    getCompiledRuntime(
      product
    )

  return (

    normalizeList(

      product.semanticLabels

      ||

      product.semantic_labels

      ||

      runtime?.semantic_labels

      ||

      runtime?.semanticLabels

      ||

      compiled?.semantic_labels

      ||

      compiled?.semanticLabels

    )

  )

}


/* ============================================================================
🔥 Workflow
============================================================================ */

function getWorkflowTags(
  product:
    FinalCtaProduct
):
  string[] {

  const runtime =
    getSemanticRuntime(
      product
    )

  const compiled =
    getCompiledRuntime(
      product
    )

  return (

    normalizeList(

      product.workflowTags

      ||

      product.workflow_tags

      ||

      runtime?.workflow_tags

      ||

      runtime?.workflowTags

      ||

      compiled?.workflow_tags

      ||

      compiled?.workflowTags

    )

  )

}


/* ============================================================================
🔥 Semantic Summary
============================================================================ */

function getSemanticSummary(
  product:
    FinalCtaProduct
):
  string {

  const runtime =
    getSemanticRuntime(
      product
    )

  const compiled =
    getCompiledRuntime(
      product
    )

  return (

    firstValue(

      product.aiSummary,

      product.ai_summary,

      runtime?.semantic_summary,

      runtime?.semanticSummary,

      compiled?.semantic_summary,

      compiled?.semanticSummary

    )

  )

}


/* ============================================================================
🔥 Semantic Reasons
============================================================================ */

function getSemanticReasons(
  product:
    FinalCtaProduct
):
  string[] {

  const runtime =
    getSemanticRuntime(
      product
    )

  return (

    normalizeList(

      runtime?.semantic_reasons

      ||

      runtime?.semanticReasons

    )

  )

}


/* ============================================================================
🔥 Product Points
============================================================================ */

/**
 * Backend AI Analysis
 *
 * API:
 *
 * product.product_points
 *
 * These are already analyzed / persisted values.
 *
 * FinalCta does NOT generate these.
 */

function getProductPoints(
  product:
    FinalCtaProduct
):
  string[] {

  return (

    normalizeList(

      product.productPoints

      ||

      product.product_points

    )

  )

}


/* ============================================================================
🔥 Related Intents
============================================================================ */

function getRelatedIntents(
  product:
    FinalCtaProduct
):
  string[] {

  const runtime =
    getSemanticRuntime(
      product
    )

  const intents =
    runtime?.related_intents

  if (
    !Array.isArray(
      intents
    )
  ) {

    return []

  }

  return (

    intents

      .map(
        (
          item:
            any
        ) =>

          firstValue(

            item?.title,

            item?.slug

          )

      )

      .filter(Boolean)

  )

}


/* ============================================================================
🔥 Grouped Attributes
============================================================================ */

function getGroupedAttributes(
  product:
    FinalCtaProduct
):
  Record<
    string,
    unknown
  > {

  const runtime =
    getSemanticRuntime(
      product
    )

  const grouped =

    runtime?.grouped_attributes

    ||

    runtime?.groupedAttributes

    ||

    {}

  if (
    grouped
    &&
    typeof grouped === 'object'
    &&
    !Array.isArray(
      grouped
    )
  ) {

    return (
      grouped as Record<
        string,
        unknown
      >
    )

  }

  return {}

}


/* ============================================================================
🔥 Normalize Attribute Value
============================================================================ */

function normalizeAttributeValue(
  value:
    unknown
):
  string {

  if (
    typeof value === 'string'
  ) {

    return (
      value.trim()
    )

  }

  if (
    typeof value === 'number'
  ) {

    return String(
      value
    )

  }

  if (
    Array.isArray(
      value
    )
  ) {

    return (

      value

        .map(
          item =>

            typeof item === 'string'
            ||
            typeof item === 'number'

              ? String(
                  item
                )

              : ''

        )

        .filter(Boolean)

        .join(
          ' / '
        )

    )

  }

  if (
    value
    &&
    typeof value === 'object'
  ) {

    const object =
      value as Record<
        string,
        unknown
      >

    return (

      firstValue(

        object.title,

        object.description,

        object.value,

        object.slug

      )

    )

  }

  return ''

}


/* ============================================================================
🔥 Grouped Attribute Entries
============================================================================ */

function getAttributeEntries(
  product:
    FinalCtaProduct
):
  Array<{
    label:
      string

    value:
      string
  }> {

  const grouped =
    getGroupedAttributes(
      product
    )

  const entries:
    Array<{
      label:
        string

      value:
        string
    }> = []

  Object.entries(
    grouped
  )

    .slice(
      0,
      6
    )

    .forEach(
      (
        [
          key,
          rawValue
        ]
      ) => {

        let value =
          ''

        /* --------------------------------------------------------------------
           Backend grouped_attributes can be:

           {
             cpu_feature: [
               {
                 title: "AI CPU",
                 description: "...",
                 role: "highlight"
               }
             ]
           }
        -------------------------------------------------------------------- */

        if (
          Array.isArray(
            rawValue
          )
        ) {

          const first =
            rawValue[0]

          if (
            first
            &&
            typeof first === 'object'
          ) {

            const item =
              first as Record<
                string,
                unknown
              >

            value =
              firstValue(

                item.title,

                item.description,

                item.value,

                item.slug

              )

          }

          else {

            value =
              normalizeAttributeValue(
                rawValue
              )

          }

        }

        else {

          value =
            normalizeAttributeValue(
              rawValue
            )

        }

        if (
          !value
        ) {

          return

        }

        entries.push({

          label:
            key,

          value,

        })

      }
    )

  return entries

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function FinalCta({

  product,

  summary,

  semanticGroups,

  semanticRuntime,

}: Props) {

  /*
   * ProductCTASectionから渡される
   * semanticRuntimeは、現在のCTA表示を壊さないため
   * 受け取りのみ行う。
   *
   * 既存のFinalCta内部Runtimeを優先する。
   */

  void summary

  void semanticGroups

  void semanticRuntime


  /* ==========================================================================
     Empty Guard
     ========================================================================== */

  if (
    !product
  ) {

    return null

  }


  /* ==========================================================================
     Resolve Product
     ========================================================================== */

  const resolvedProduct =
    resolveProduct(
      product as FinalCtaProduct
    )


  /* ==========================================================================
     Runtime
     ========================================================================== */

  const runtime =
    getSemanticRuntime(
      resolvedProduct
    )

  const compiled =
    getCompiledRuntime(
      resolvedProduct
    )


  /* ==========================================================================
     Semantic
     ========================================================================== */

  const semanticLabels =
    getSemanticLabels(
      resolvedProduct
    )

  const workflowTags =
    getWorkflowTags(
      resolvedProduct
    )

  const semanticSummary =
    getSemanticSummary(
      resolvedProduct
    )

  const semanticReasons =
    getSemanticReasons(
      resolvedProduct
    )

  const productPoints =
    getProductPoints(
      resolvedProduct
    )

  const relatedIntents =
    getRelatedIntents(
      resolvedProduct
    )

  const groupedAttributes =
    getAttributeEntries(
      resolvedProduct
    )


  /* ==========================================================================
     Human Runtime
     ========================================================================== */

  const targetUser =
    firstValue(

      resolvedProduct.targetUser,

      resolvedProduct.target_user

    )


  const strengths =
    normalizeList(

      resolvedProduct.strengths

    )


  const weaknesses =
    normalizeList(

      resolvedProduct.weaknesses

    )


  const usageTags =
    normalizeList(

      resolvedProduct.usageTags

      ||

      resolvedProduct.usage_tags

    )


  /* ==========================================================================
     Commerce
     ========================================================================== */

  const imageUrl =
    firstValue(

      resolvedProduct.imageUrl,

      resolvedProduct.image_url

    )


  const affiliateUrl =
    firstValue(

      resolvedProduct.affiliateUrl,

      resolvedProduct.affiliate_url

    )


  const productUrl =
    firstValue(

      resolvedProduct.url

    )


  const finalUrl =
    affiliateUrl

    ||

    productUrl


  /* ==========================================================================
     Identity
     ========================================================================== */

  const maker =
    firstValue(

      resolvedProduct.maker,

      resolvedProduct.brand

    )


  const productName =
    firstValue(

      resolvedProduct.name

    )


  /* ==========================================================================
     Semantic Score
     ========================================================================== */

  const semanticScore =
    Number(

      resolvedProduct.semanticScore

      ??

      resolvedProduct.semantic_score

      ??

      compiled?.semantic_score

      ??

      0

    )


  /* ==========================================================================
     Meaning Availability
     ========================================================================== */

  const hasMeaning =

    semanticLabels.length > 0

    ||

    workflowTags.length > 0

    ||

    Boolean(
      semanticSummary
    )

    ||

    semanticReasons.length > 0

    ||

    productPoints.length > 0

    ||

    groupedAttributes.length > 0

    ||

    Boolean(
      targetUser
    )

    ||

    strengths.length > 0

    ||

    weaknesses.length > 0

    ||

    usageTags.length > 0


  /* ==========================================================================
     Render
     ========================================================================== */

  return (

    <section
      className={
        styles.finalCta
      }
    >

      {/* ================================================================
          HEADER
      ================================================================ */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.eyebrow
          }
        >

          PRODUCT INSIGHT

        </div>


        <h2
          className={
            styles.title
          }
        >

          このPCの特徴

        </h2>


        <p
          className={
            styles.description
          }
        >

          製品のRealityとSemantic Runtimeから、
          このPCの特徴・用途・注意点を整理しています。

        </p>

      </div>


      {/* ================================================================
          IDENTITY
      ================================================================ */}

      <div
        className={
          styles.identity
        }
      >

        {
          maker
          &&
          (
            <div
              className={
                styles.maker
              }
            >

              {
                maker
              }

            </div>
          )
        }


        {
          productName
          &&
          (
            <h3
              className={
                styles.productName
              }
            >

              {
                productName
              }

            </h3>
          )
        }

      </div>


      {/* ================================================================
          MAIN
      ================================================================ */}

      <div
        className={
          styles.main
        }
      >

        {/* ============================================================
            MEANING
        ============================================================ */}

        <div
          className={
            styles.meaning
          }
        >

          {/* ========================================================
              SEMANTIC LABELS
          ======================================================== */}

          {
            semanticLabels.length > 0
            &&
            (
              <div
                className={
                  styles.labels
                }
              >

                {
                  semanticLabels.map(
                    (
                      label,
                      index
                    ) => (

                      <span
                        key={
                          `${label}-${index}`
                        }

                        className={
                          styles.semanticLabel
                        }
                      >

                        {
                          label
                        }

                      </span>

                    )
                  )
                }

              </div>
            )
          }


          {/* ========================================================
              SEMANTIC SUMMARY
          ======================================================== */}

          {
            semanticSummary
            &&
            (
              <div
                className={
                  styles.summary
                }
              >

                {
                  semanticSummary
                }

              </div>
            )
          }


          {/* ========================================================
              ⭐ AI ANALYZED PRODUCT POINTS
          ======================================================== */}

          {
            productPoints.length > 0
            &&
            (
              <div
                className={
                  styles.humanSection
                }
              >

                <h4>
                  このPCのポイント
                </h4>

                <ul>

                  {
                    productPoints.map(
                      (
                        point,
                        index
                      ) => (

                        <li
                          key={
                            `${point}-${index}`
                          }
                        >

                          {
                            point
                          }

                        </li>

                      )
                    )
                  }

                </ul>

              </div>
            )
          }


          {/* ========================================================
              GROUPED SEMANTIC ATTRIBUTES
          ======================================================== */}

          {
            groupedAttributes.length > 0
            &&
            (
              <div
                className={
                  styles.attributeSection
                }
              >

                <h4>
                  Semantic Runtime
                </h4>

                <div
                  className={
                    styles.attributeGrid
                  }
                >

                  {
                    groupedAttributes.map(
                      (
                        attribute,
                        index
                      ) => (

                        <div
                          key={
                            `${attribute.label}-${index}`
                          }

                          className={
                            styles.attributeCard
                          }
                        >

                          <div
                            className={
                              styles.attributeLabel
                            }
                          >

                            {
                              attribute.label
                            }

                          </div>


                          <div
                            className={
                              styles.attributeValue
                            }
                          >

                            {
                              attribute.value
                            }

                          </div>

                        </div>

                      )
                    )
                  }

                </div>

              </div>
            )
          }


          {/* ========================================================
              REASONS
          ======================================================== */}

          {
            semanticReasons.length > 0
            &&
            (
              <div
                className={
                  styles.reasons
                }
              >

                <h4>
                  このPCが選ばれる理由
                </h4>

                <ul>

                  {
                    semanticReasons.map(
                      (
                        reason,
                        index
                      ) => (

                        <li
                          key={
                            `${reason}-${index}`
                          }
                        >

                          {
                            reason
                          }

                        </li>

                      )
                    )
                  }

                </ul>

              </div>
            )
          }


          {/* ========================================================
              TARGET USER
          ======================================================== */}

          {
            targetUser
            &&
            (
              <div
                className={
                  styles.humanSection
                }
              >

                <h4>
                  こんな方に向いています
                </h4>

                <p>

                  {
                    targetUser
                  }

                </p>

              </div>
            )
          }


          {/* ========================================================
              STRENGTHS
          ======================================================== */}

          {
            strengths.length > 0
            &&
            (
              <div
                className={
                  styles.humanSection
                }
              >

                <h4>
                  このPCの強み
                </h4>

                <ul>

                  {
                    strengths.map(
                      (
                        item,
                        index
                      ) => (

                        <li
                          key={
                            `${item}-${index}`
                          }
                        >

                          {
                            item
                          }

                        </li>

                      )
                    )
                  }

                </ul>

              </div>
            )
          }


          {/* ========================================================
              WEAKNESSES
          ======================================================== */}

          {
            weaknesses.length > 0
            &&
            (
              <div
                className={
                  styles.humanSection
                }
              >

                <h4>
                  注意したいポイント
                </h4>

                <ul>

                  {
                    weaknesses.map(
                      (
                        item,
                        index
                      ) => (

                        <li
                          key={
                            `${item}-${index}`
                          }
                        >

                          {
                            item
                          }

                        </li>

                      )
                    )
                  }

                </ul>

              </div>
            )
          }


          {/* ========================================================
              USAGE
          ======================================================== */}

          {
            usageTags.length > 0
            &&
            (
              <div
                className={
                  styles.usage
                }
              >

                {
                  usageTags.map(
                    (
                      tag,
                      index
                    ) => (

                      <span
                        key={
                          `${tag}-${index}`
                        }
                      >

                        {
                          tag
                        }

                      </span>

                    )
                  )
                }

              </div>
            )
          }


          {/* ========================================================
              RELATED INTENTS
          ======================================================== */}

          {
            relatedIntents.length > 0
            &&
            (
              <div
                className={
                  styles.usage
                }
              >

                {
                  relatedIntents.map(
                    (
                      intent,
                      index
                    ) => (

                      <span
                        key={
                          `${intent}-${index}`
                        }
                      >

                        {
                          intent
                        }

                      </span>

                    )
                  )
                }

              </div>
            )
          }


          {/* ========================================================
              FALLBACK
          ======================================================== */}

          {
            !hasMeaning
            &&
            (
              <div
                className={
                  styles.emptyMeaning
                }
              >

                製品の詳細情報をご確認ください。

              </div>
            )
          }

        </div>


        {/* ================================================================
            COMMERCE
        ================================================================ */}

        <div
          className={
            styles.commerce
          }
        >

          {/* ========================================================
              PRODUCT IMAGE
          ======================================================== */}

          {
            imageUrl
            &&
            (
              <div
                className={
                  styles.imageWrapper
                }
              >

                <img
                  src={
                    imageUrl
                  }

                  alt={
                    productName
                    ||
                    '商品画像'
                  }

                  width={
                    640
                  }

                  height={
                    480
                  }

                  loading="lazy"

                  decoding="async"

                  className={
                    styles.image
                  }

                />

              </div>
            )
          }


          {/* ========================================================
              AFFILIATE CTA
          ======================================================== */}

          {
            finalUrl
            &&
            (
              <a
                href={
                  finalUrl
                }

                target="_blank"

                rel="nofollow noopener noreferrer"

                className={
                  styles.ctaButton
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
          }


          {/* ========================================================
              STORE INFORMATION
          ======================================================== */}

          {
            finalUrl
            &&
            (
              <div
                className={
                  styles.storeLink
                }
              >

                {
                  affiliateUrl
                    ?
                    '販売元の商品ページへ'
                    :
                    '商品ページを開く'
                }

              </div>
            )
          }


          {/* ========================================================
              TRUST
          ======================================================== */}

          <div
            className={
              styles.trust
            }
          >

            正規販売ページを開きます。

          </div>


          {/* ========================================================
              NOTICE
          ======================================================== */}

          <div
            className={
              styles.notice
            }
          >

            ※価格・在庫・販売条件は
            販売ページでご確認ください。

          </div>

        </div>

      </div>

    </section>

  )

}